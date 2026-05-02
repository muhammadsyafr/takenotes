"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const init_1 = require("./db/init");
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const categories_1 = __importDefault(require("./routes/categories"));
const tags_1 = __importDefault(require("./routes/tags"));
const envPath = path_1.default.resolve(process.cwd(), '.env');
const envPathBackup = path_1.default.resolve(process.cwd(), '../.env');
dotenv_1.default.config({ path: fs_1.default.existsSync(envPath) ? envPath : envPathBackup });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
(0, init_1.initializeDatabase)();
app.use('/api/auth', auth_1.default);
app.use('/api/notes', notes_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/tags', tags_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map