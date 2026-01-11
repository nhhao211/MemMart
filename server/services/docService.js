const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } = require('docx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Convert Markdown content to DOCX format
 * Supports: headings, bold, italic, lists, code blocks, blockquotes
 */
async function convertMarkdownToDocx(docId) {
    try {
        // Fetch the Markdown content from the database
        const doc = await prisma.document.findUnique({
            where: { id: parseInt(docId) },
            select: { title: true, content: true }
        });

        if (!doc) {
            throw new Error('Document not found');
        }

        // Parse markdown content and create paragraphs
        const paragraphs = parseMarkdownToDocx(doc.content);

        // Create document with title
        const docxDoc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: doc.title || 'Untitled Document',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { after: 400 },
                    }),
                    ...paragraphs
                ]
            }]
        });

        // Pack the document into a buffer
        const buffer = await Packer.toBuffer(docxDoc);
        return buffer;
    } catch (error) {
        console.error('Error converting markdown to DOCX:', error);
        throw error;
    }
}

/**
 * Parse markdown string into DOCX paragraphs
 */
function parseMarkdownToDocx(content) {
    const paragraphs = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        
        // Skip empty lines
        if (line.trim() === '') {
            paragraphs.push(new Paragraph({ text: '' }));
            i++;
            continue;
        }

        // Headings (H1-H6)
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            const headingLevels = {
                1: HeadingLevel.HEADING_1,
                2: HeadingLevel.HEADING_2,
                3: HeadingLevel.HEADING_3,
                4: HeadingLevel.HEADING_4,
                5: HeadingLevel.HEADING_5,
                6: HeadingLevel.HEADING_6,
            };
            paragraphs.push(new Paragraph({
                text: text,
                heading: headingLevels[level],
                spacing: { before: 200, after: 200 }
            }));
            i++;
            continue;
        }

        // Code blocks (```...```)
        if (line.trim().startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: codeLines.join('\n'),
                        font: 'Courier New',
                        size: 20,
                    })
                ],
                spacing: { before: 100, after: 100 }
            }));
            i++;
            continue;
        }

        // Blockquotes
        if (line.trim().startsWith('>')) {
            const quoteText = line.replace(/^\s*>\s*/, '');
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: quoteText, italics: true })],
                spacing: { before: 100, after: 100 },
                border: {
                    left: {
                        color: '999999',
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6,
                    }
                }
            }));
            i++;
            continue;
        }

        // Regular paragraph with inline formatting
        const children = parseInlineFormatting(line);
        paragraphs.push(new Paragraph({
            children: children,
            spacing: { after: 100 }
        }));
        i++;
    }

    return paragraphs;
}

/**
 * Parse inline markdown formatting (bold, italic, code)
 */
function parseInlineFormatting(text) {
    const children = [];
    let i = 0;

    while (i < text.length) {
        // Bold (**text** or __text__)
        const boldMatch = text.slice(i).match(/^(\*\*|__)(.*?)\1/);
        if (boldMatch) {
            children.push(new TextRun({
                text: boldMatch[2],
                bold: true
            }));
            i += boldMatch[0].length;
            continue;
        }

        // Italic (*text* or _text_)
        const italicMatch = text.slice(i).match(/^(\*|_)(.*?)\1/);
        if (italicMatch && italicMatch[0].length > 2) {
            children.push(new TextRun({
                text: italicMatch[2],
                italics: true
            }));
            i += italicMatch[0].length;
            continue;
        }

        // Inline code (`text`)
        const codeMatch = text.slice(i).match(/^`([^`]+)`/);
        if (codeMatch) {
            children.push(new TextRun({
                text: codeMatch[1],
                font: 'Courier New',
                shd: { fill: 'F0F0F0' }
            }));
            i += codeMatch[0].length;
            continue;
        }

        // Regular text
        const nextSpecial = text.slice(i).search(/[\*_`]/);
        if (nextSpecial === -1) {
            children.push(new TextRun(text.slice(i)));
            break;
        } else {
            children.push(new TextRun(text.slice(i, i + nextSpecial)));
            i += nextSpecial;
        }
    }

    return children.length > 0 ? children : [new TextRun('')];
}

module.exports = { convertMarkdownToDocx };