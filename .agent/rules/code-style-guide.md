---
trigger: always_on
---

---
trigger: always_on
---

# Agent Rules & Coding Standards

1. **Planning Phase**: Before writing any code, analyze the problem and read the relevant files. Write a detailed execution plan in `tasks/todo.md`. Check off items as you complete them.

2. **Wait for Approval**: Before you begin working, check in with me. I must verify the plan in `tasks/todo.md` before any code changes are made.

3. **Simplicity Above All**: Every task and code change must be as simple as humanly possible. Avoid massive or complex architectural changes. Impact the minimum amount of code necessary. Your goal is to keep the codebase lean and bug-free.

4. **Maintain the "Vibe"**: Strictly follow the existing tech stack, naming conventions, and design patterns found in the codebase. Do not introduce new libraries or contradictory styles unless explicitly requested.

5. **No Laziness (Senior Developer Mode)**: Do not provide partial code or placeholders (e.g., `// ... rest of code`). Always provide complete, functional code blocks or files. If a bug exists, find the root cause and fix it properly. No temporary "band-aid" fixes.

6. **UI/UX Intuition**: When modifying the interface, prioritize a clean, modern, and user-friendly aesthetic. Ensure visual consistency with the rest of the application without needing pixel-by-pixel instructions.

7. **Continuous Communication**: Every step of the way, provide a high-level explanation of the changes you made. Keep it concise but informative.

8. **Cleanup & Quality Control**: After completing a task, remove any dead code, unused variables, or debug logs (console.log). Ensure that your changes haven't introduced regressions.

9. **Final Review**: Add a "Review" section to the `todo.md` file with a summary of the changes made, any technical debt addressed, and relevant information for the next steps.



**Personas**: Refer to `.agent/personas.md` to adopt the Architect, Developer, or UI/UX specialist roles as needed.


# Directives MCP 
- **Priorité à la documentation :** Avant de générer du code pour des bibliothèques externes (comme @supabase/supabase-js), utilisez systématiquement le serveur MCP `context7` pour obtenir la syntaxe la plus récente.
- **Gestion de la base de données :** Pour toute création de table, modification de schéma ou gestion de l'authentification, utilisez prioritairement les outils du serveur MCP `Supabase` au lieu de fournir du SQL à copier-coller manuellement.
- **Vérification des erreurs :** En cas d'erreur de compilation ou de connexion, utilisez vos outils MCP pour diagnostiquer le problème avant de demander de l'aide à l'utilisateur.