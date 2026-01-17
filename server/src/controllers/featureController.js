import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new feature
export async function createFeature(req, res) {
    try {
        const { title, description } = req.body;
        const userId = req.user.uid; // Using firebaseUid from auth middleware (req.user is typically decoded token)
        // Wait, in docController it accesses: const userId = req.user.uid;
        // Then finds user via prisma.user.findUnique({ where: { firebaseUid: userId } });
        // I need to replicate that logic because feature.userId is Int (Postgres ID), not String (Firebase UID).

        const user = await prisma.user.findUnique({
            where: { firebaseUid: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const feature = await prisma.feature.create({
            data: {
                title,
                description,
                userId: user.id
            }
        });

        res.status(201).json(feature);
    } catch (error) {
        console.error('Error creating feature:', error);
        res.status(500).json({ error: 'Failed to create feature' });
    }
}

// Get all features for the user
export async function getFeatures(req, res) {
    try {
        const userId = req.user.uid;

        const user = await prisma.user.findUnique({
            where: { firebaseUid: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const features = await prisma.feature.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { documents: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(features);
    } catch (error) {
        console.error('Error getting features:', error);
        res.status(500).json({ error: 'Failed to get features' });
    }
}

// Get a single feature with its documents
export async function getFeatureById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const user = await prisma.user.findUnique({
            where: { firebaseUid: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const feature = await prisma.feature.findFirst({
            where: { 
                id: parseInt(id),
                userId: user.id
            },
            include: {
                documents: {
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        isFavorite: true,
                        updatedAt: true,
                        createdAt: true
                        // exclude content
                    }
                }
            }
        });

        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }

        res.json(feature);
    } catch (error) {
        console.error('Error getting feature:', error);
        res.status(500).json({ error: 'Failed to get feature' });
    }
}

// Update a feature
export async function updateFeature(req, res) {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const userId = req.user.uid;

        const user = await prisma.user.findUnique({
            where: { firebaseUid: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const feature = await prisma.feature.updateMany({
            where: { 
                id: parseInt(id),
                userId: user.id
            },
            data: {
                title,
                description,
                status
            }
        });

        if (feature.count === 0) {
            return res.status(404).json({ error: 'Feature not found' });
        }

        res.json({ message: 'Feature updated successfully' });
    } catch (error) {
        console.error('Error updating feature:', error);
        res.status(500).json({ error: 'Failed to update feature' });
    }
}

// Delete a feature
export async function deleteFeature(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const user = await prisma.user.findUnique({
             where: { firebaseUid: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check ownership
        const feature = await prisma.feature.findFirst({
            where: { 
                id: parseInt(id),
                userId: user.id
            }
        });

        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }

        await prisma.feature.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Feature deleted successfully' });
    } catch (error) {
        console.error('Error deleting feature:', error);
        res.status(500).json({ error: 'Failed to delete feature' });
    }
}
