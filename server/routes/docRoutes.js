const express = require('express');
const router = express.Router();
const { convertMarkdownToDocx } = require('../services/docService');

// Export document as DOCX
router.get('/:id/export/docx', async (req, res) => {
    try {
        const docId = req.params.id;
        const docxBuffer = await convertMarkdownToDocx(docId);
        res.setHeader('Content-Disposition', `attachment; filename=document-${docId}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(docxBuffer);
    } catch (error) {
        res.status(500).send({ error: 'Failed to export document.' });
    }
});

module.exports = router;