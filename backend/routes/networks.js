const express = require('express');
const router = express.Router();
const Network = require('../models/Network');
const auth = require('../middleware/auth');

// Get all networks for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const networks = await Network.find({ user: req.user.id });
        res.json(networks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific network
router.get('/:id', auth, async (req, res) => {
    try {
        const network = await Network.findOne({ _id: req.params.id, user: req.user.id });
        if (!network) return res.status(404).json({ message: 'Network not found' });
        res.json(network);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new network
router.post('/', auth, async (req, res) => {
    const { name, description, nodes, edges } = req.body;
    try {
        const newNetwork = new Network({
            user: req.user.id,
            name,
            description,
            nodes,
            edges
        });
        const savedNetwork = await newNetwork.save();
        res.status(201).json(savedNetwork);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update network
router.put('/:id', auth, async (req, res) => {
    const { name, description, nodes, edges } = req.body;
    try {
        let network = await Network.findOne({ _id: req.params.id, user: req.user.id });
        if (!network) return res.status(404).json({ message: 'Network not found' });

        network.name = name || network.name;
        network.description = description || network.description;
        network.nodes = nodes || network.nodes;
        network.edges = edges || network.edges;
        network.updatedAt = Date.now();

        const updatedNetwork = await network.save();
        res.json(updatedNetwork);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete network
router.delete('/:id', auth, async (req, res) => {
    try {
        const network = await Network.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!network) return res.status(404).json({ message: 'Network not found' });
        res.json({ message: 'Network deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
