import { Router } from 'express';
import { askJbn, askJbnStream } from '../services/askJbnService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// POST /api/ask-jbn — AI-powered Q&A about Japanese cannabinoid regulations
router.post('/', async (req, res, next) => {
  try {
    const { query, language = 'en', stream = true } = req.body;

    // --- Validation ---
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query is required and must be a string' });
    }
    if (query.length > 500) {
      return res.status(400).json({ error: 'query must be 500 characters or fewer' });
    }
    const lang: 'en' | 'ja' = language === 'ja' ? 'ja' : 'en';

    // --- Streaming mode ---
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      try {
        const { stream: anthropicStream, context } = await askJbnStream({ query, language: lang });

        // Send search context as first event
        res.write(`event: context\ndata: ${JSON.stringify(context)}\n\n`);

        // Read and forward the Anthropic SSE stream
        const reader = (anthropicStream as any).getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                res.write(`event: text\ndata: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
              }
            } catch {
              // Skip non-JSON lines (e.g. event: lines from Anthropic)
            }
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                res.write(`event: text\ndata: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
              }
            } catch {
              // ignore
            }
          }
        }

        res.write(`event: done\ndata: {}\n\n`);
        res.end();
      } catch (err) {
        logger.error('Ask JBN stream error', { error: err });
        // If headers already sent, send error as SSE event
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'An error occurred while streaming the response' })}\n\n`);
        res.end();
      }

      return;
    }

    // --- Non-streaming mode ---
    const result = await askJbn({ query, language: lang });
    res.json({ data: { answer: result.answer, context: result.context } });
  } catch (err) {
    next(err);
  }
});

export default router;
