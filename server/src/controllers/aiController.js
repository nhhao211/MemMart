import { refineMarkdown, generateMermaidDiagram } from "../services/aiService.js";

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

/**
 * POST /api/v1/ai/generate-diagram
 * Generate Mermaid diagram code from text prompt
 */
export async function generateDiagram(req, res, next) {
  try {
    const { prompt, type } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const diagramCode = await generateMermaidDiagram({ prompt, type });

    return res.status(200).json({
      success: true,
      data: { code: diagramCode },
    });
  } catch (error) {
    next(error);
  }
}

