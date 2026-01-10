import { refineMarkdown } from "../services/aiService.js";

/**
 * POST /api/v1/ai/refine
 * Refine Markdown content using AI
 */
export async function refine(req, res, next) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const refined = await refineMarkdown({ content });

    return res.status(200).json({
      success: true,
      data: { content: refined },
    });
  } catch (error) {
    next(error);
  }
}
