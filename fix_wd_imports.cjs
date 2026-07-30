const fs = require('fs');
let code = fs.readFileSync('src/components/WorldDictionary.tsx', 'utf8');

code = code.replace(/import \{ collection, addDoc, doc, updateDoc \} from "firebase\/firestore";/, 'import { collection, addDoc } from "firebase/firestore";');

code = code.replace(/  History,\n  X,\n  Clock,\n  Trash2,\n/g, '');

fs.writeFileSync('src/components/WorldDictionary.tsx', code);
