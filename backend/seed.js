const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Network = require('./models/Network');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        //     useNewUrlParser: false,
        //     useUnifiedTopology: false,
        });
        console.log('MongoDB connected for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Network.deleteMany({});

        // Create Demo User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const demoUser = new User({
            username: 'demo_engineer',
            email: 'demo@example.com',
            password: hashedPassword // storing hashed password manually since we are bypassing save hook middleware sometimes in seeds, but here we construct it carefully. 
            // actually the model pre-save hook handles hashing if we just save the document, 
            // but let's stick to the model instantiation. 
            // Wait, I defined a pre-save hook. So if I just create the user object and save, it hashes.
            // If I pass the hashed password to the constructor and save, it might hash it again if 'isModified' is true.
        });

        // Let's rely on the pre-save hook.
        const user = await User.create({
            username: 'demo_engineer',
            email: 'demo@example.com',
            password: 'password123'
        });

        console.log(`User created: ${user.username} (password: password123)`);

        // Create Sample Network
        const sampleNetwork = new Network({
            user: user._id,
            name: 'Office HQ Layer 1',
            description: 'Core backbone topology for the main office.',
            nodes: [
                { id: '1', type: 'device', position: { x: 250, y: 5 }, data: { label: 'Core Router', type: 'router' } },
                { id: '2', type: 'device', position: { x: 100, y: 100 }, data: { label: 'Switch A', type: 'switch' } },
                { id: '3', type: 'device', position: { x: 400, y: 100 }, data: { label: 'Switch B', type: 'switch' } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e1-3', source: '1', target: '3', animated: true }
            ]
        });

        await sampleNetwork.save();
        console.log('Sample network created');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
