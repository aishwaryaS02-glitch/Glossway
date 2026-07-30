const fs = require('fs');
let code = fs.readFileSync('src/components/WorldDictionary.tsx', 'utf8');

// The unused variables are doc, updateDoc, History, X, Clock, Trash2, onUpdateUserProfile
// Remove them from imports
code = code.replace(/import \{ doc, updateDoc \} from "firebase\/firestore";\n/, '');
code = code.replace(/import \{ Search, ArrowRight, Play, BookOpen, Volume2, Layers, Sparkles, Brain, Loader2, ArrowLeft, MoreHorizontal, MessageSquare, ListFilter, Plus, Check, Save, Share2, History, X, Clock, Trash2 \} from "lucide-react";/, 'import { Search, ArrowRight, Play, BookOpen, Volume2, Layers, Sparkles, Brain, Loader2, ArrowLeft, MoreHorizontal, MessageSquare, ListFilter, Plus, Check, Save, Share2 } from "lucide-react";');

// Also remove from props
code = code.replace(/  onUpdateUserProfile,/, '  // onUpdateUserProfile,');

fs.writeFileSync('src/components/WorldDictionary.tsx', code);
