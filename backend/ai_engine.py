import os
import re
import json
import httpx
from typing import List, Dict, Optional, Tuple


class FreeCareerAI:
    def __init__(self):
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "gemma3")
        self.use_local_llm = os.getenv("USE_LOCAL_LLM", "true").lower() == "true"

        self.knowledge_base = {
            "resume": [
                "Use a strong headline with target role and tech stack.",
                "Write a 2 to 3 line summary focused on skills, projects, and career goal.",
                "Show measurable project impact when possible.",
                "Use action verbs like built, developed, integrated, optimized.",
                "Keep fresher resume to one page if possible.",
                "Add GitHub, LinkedIn, portfolio, and deployed project links.",
            ],
            "interview": [
                "Prepare self introduction in 60 to 90 seconds.",
                "Revise core frontend concepts: HTML, CSS, JavaScript, React, Next.js.",
                "Revise backend basics: APIs, auth, database, error handling.",
                "Be ready to explain your project architecture clearly.",
                "Practice common HR, project, and technical questions.",
            ],
            "roadmap": [
                "HTML, CSS, JavaScript fundamentals.",
                "React basics and component thinking.",
                "Next.js routing, layouts, data fetching, and deployment.",
                "Tailwind CSS and responsive UI.",
                "Backend with FastAPI or Node.js.",
                "MongoDB or SQL basics.",
                "Authentication and authorization.",
                "Git, GitHub, deployment, debugging, and interview prep.",
            ],
            "projects": [
                "AI Job Portal",
                "Resume Analyzer",
                "Interview Practice App",
                "Typing Test Platform",
                "Task Manager",
                "Student Progress Tracker",
            ],
            "cover_letter": [
                "Start with the exact role title.",
                "Mention 2 relevant skills and 1 strong project.",
                "Explain why you fit the role and company.",
                "End with confidence and interest in interview discussion.",
            ],
            "job_match": [
                "Compare required skills with user skills.",
                "Highlight missing skills.",
                "Suggest interview topics for the specific role.",
                "Suggest resume keywords to add.",
            ],
        }

    def _normalize(self, text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r"[^a-z0-9\s+#.-]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text

    def detect_intent(self, message: str) -> str:
        text = self._normalize(message)

        intent_keywords = {
            "resume": ["resume", "cv", "ats", "summary", "improve resume"],
            "interview": ["interview", "questions", "hr round", "technical round", "self introduction"],
            "roadmap": ["roadmap", "skill", "learn", "study plan", "how to become"],
            "projects": ["project", "portfolio", "ideas", "build", "minor project"],
            "cover_letter": ["cover letter", "application letter"],
            "job_match": ["match", "fit for this job", "missing skills", "job match"],
        }

        scores = {intent: 0 for intent in intent_keywords}

        for intent, keywords in intent_keywords.items():
            for kw in keywords:
                if kw in text:
                    scores[intent] += 1

        best_intent = max(scores, key=scores.get)
        return best_intent if scores[best_intent] > 0 else "general"

    def extract_profile_hints(self, message: str, user_profile: Optional[Dict[str, str]]) -> Dict[str, str]:
        profile = {
            "name": "",
            "target_role": "",
            "skills": "",
            "experience": "",
        }

        if user_profile:
            for key in profile:
                profile[key] = user_profile.get(key, "")

        text = self._normalize(message)

        role_patterns = [
            "frontend developer",
            "backend developer",
            "full stack developer",
            "python developer",
            "fastapi developer",
            "react developer",
            "next js developer",
            "software developer",
        ]

        for role in role_patterns:
            if role in text and not profile["target_role"]:
                profile["target_role"] = role.title()

        if "fresher" in text and not profile["experience"]:
            profile["experience"] = "Fresher"

        return profile

    def retrieve_context(self, message: str, intent: str) -> List[str]:
        text = self._normalize(message)
        tokens = set(text.split())
        results: List[Tuple[int, str]] = []

        if intent in self.knowledge_base:
            for item in self.knowledge_base[intent]:
                item_tokens = set(self._normalize(item).split())
                score = len(tokens.intersection(item_tokens))
                results.append((score, item))

        if intent == "general":
            for section_items in self.knowledge_base.values():
                for item in section_items:
                    item_tokens = set(self._normalize(item).split())
                    score = len(tokens.intersection(item_tokens))
                    results.append((score, item))

        results.sort(key=lambda x: x[0], reverse=True)
        top = [item for score, item in results if score > 0][:6]

        if not top and intent in self.knowledge_base:
            top = self.knowledge_base[intent][:4]

        if not top:
            top = [
                "Be practical and specific.",
                "Guide the user as a fresher if experience is low.",
                "Prefer short actionable steps.",
                "Mention relevant projects and skills.",
            ]

        return top

    def build_system_prompt(
        self,
        intent: str,
        profile: Dict[str, str],
        context_items: List[str],
    ) -> str:
        context_block = "\n".join([f"- {item}" for item in context_items])

        return f"""
You are Career Copilot, an AI career assistant inside a job portal.

Behavior:
- sound professional, practical, and supportive
- help mainly with resume, interview, projects, roadmap, job readiness
- keep answers structured and useful
- do not overpromise
- guide freshers clearly
- when possible, give step-by-step output
- when the user asks vague questions, make a best practical assumption and answer directly

User Profile:
- Name: {profile.get("name", "")}
- Target Role: {profile.get("target_role", "")}
- Skills: {profile.get("skills", "")}
- Experience: {profile.get("experience", "")}

Detected Intent:
- {intent}

Relevant Context:
{context_block}

Response Style:
- start with the direct answer
- use short sections
- use bullets only when helpful
- end with 3 useful next-step suggestions if relevant
""".strip()

    async def ask_local_llm(
        self,
        message: str,
        history: List[Dict[str, str]],
        system_prompt: str,
    ) -> Optional[str]:
        if not self.use_local_llm:
            return None

        payload = {
            "model": self.ollama_model,
            "stream": False,
            "messages": [
                {"role": "system", "content": system_prompt},
                *history[-8:],
                {"role": "user", "content": message},
            ],
            "options": {
                "temperature": 0.5,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(self.ollama_url, json=payload)

            if response.status_code != 200:
                return None

            data = response.json()
            return data.get("message", {}).get("content")
        except Exception:
            return None

    def fallback_response(
        self,
        message: str,
        intent: str,
        profile: Dict[str, str],
        context_items: List[str],
    ) -> str:
        role = profile.get("target_role") or "developer"
        skills = profile.get("skills") or "your current skills"
        exp = profile.get("experience") or "fresher"

        if intent == "resume":
            return f"""Here is a stronger resume strategy for a {exp.lower()} {role.lower()}:

1. Add a clear headline
   Example: {role} | Next.js | FastAPI | MongoDB

2. Write a short summary
   Mention your skills, project strength, and job goal in 2 to 3 lines.

3. Improve project entries
   For every project include:
   - problem solved
   - tech stack
   - key features
   - your contribution
   - deployment / GitHub link

4. Show relevant skills clearly
   Current profile skills: {skills}

5. Use strong verbs
   Built, Developed, Integrated, Optimized, Designed

6. Keep the format clean
   Good spacing, no long paragraphs, easy scanning

Priority improvements:
- {context_items[0]}
- {context_items[1]}
- {context_items[2]}
"""

        if intent == "interview":
            return f"""Here is a better interview prep plan for a {exp.lower()} {role.lower()}:

Focus Areas:
- Self introduction
- Project explanation
- Core concepts
- Problem solving
- HR round confidence

What to revise:
- {context_items[0]}
- {context_items[1]}
- {context_items[2]}
- {context_items[3]}

Sample questions:
1. Tell me about yourself.
2. Explain one major project from your portfolio.
3. Why did you choose {role}?
4. What challenges did you face in your project?
5. How does frontend connect with backend in your app?
"""

        if intent == "roadmap":
            return f"""Here is a focused roadmap for becoming a stronger {role.lower()}:

Phase 1:
- {context_items[0]}
- {context_items[1]}

Phase 2:
- {context_items[2]}
- {context_items[3]}

Phase 3:
- Build 2 strong projects
- Practice interviews
- Improve resume and deployment quality

For your background, I would prioritize:
1. Strong JavaScript fundamentals
2. Real full stack projects
3. Clean GitHub and deployed demos
"""

        if intent == "projects":
            return f"""These are strong project ideas for your profile:

1. AI Job Portal
2. Resume Analyzer
3. Interview Practice App
4. Typing Test Platform
5. Task Manager with auth

Make each project stronger by adding:
- authentication
- role-based dashboard
- search and filters
- analytics
- polished UI
- deployment
"""

        if intent == "cover_letter":
            return f"""Use this cover letter structure for a {role.lower()} application:

- Opening: mention the role directly
- Mid part: mention 2 relevant skills and 1 project
- Value: explain what you can contribute
- Ending: express strong interest and availability

Main points to include:
- {context_items[0]}
- {context_items[1]}
- {context_items[2]}
"""

        return f"""I can help you properly with career guidance.

Based on your profile:
- Target role: {role}
- Skills: {skills}
- Experience: {exp}

Best directions from here:
- {context_items[0]}
- {context_items[1]}
- {context_items[2]}

Ask me things like:
- Improve my resume summary
- Give me interview questions for {role}
- Create a roadmap for {role}
- Suggest portfolio projects
"""

    def build_suggestions(self, intent: str) -> List[str]:
        mapping = {
            "resume": [
                "Improve my resume summary",
                "Give ATS tips for fresher resume",
                "Rewrite my project section",
                "What skills should I highlight?",
            ],
            "interview": [
                "Give me HR interview questions",
                "Ask me technical questions",
                "Help me with self introduction",
                "What should I say about my project?",
            ],
            "roadmap": [
                "Create a 30-day roadmap",
                "What should I learn first?",
                "How do I become job-ready?",
                "Suggest a study plan",
            ],
            "projects": [
                "Suggest 5 portfolio projects",
                "Which project should I build next?",
                "How do I make my project stand out?",
                "Give me project ideas with AI",
            ],
            "cover_letter": [
                "Write a cover letter for me",
                "Make it short and professional",
                "Tailor it for fresher role",
                "Use my project in cover letter",
            ],
        }
        return mapping.get(
            intent,
            [
                "Improve my resume",
                "Give me interview questions",
                "Create a skill roadmap",
                "Suggest portfolio projects",
            ],
        )

    async def reply(
        self,
        message: str,
        history: List[Dict[str, str]],
        user_profile: Optional[Dict[str, str]] = None,
    ) -> Dict[str, object]:
        intent = self.detect_intent(message)
        profile = self.extract_profile_hints(message, user_profile)
        context_items = self.retrieve_context(message, intent)
        system_prompt = self.build_system_prompt(intent, profile, context_items)

        llm_reply = await self.ask_local_llm(message, history, system_prompt)

        final_reply = llm_reply or self.fallback_response(
            message=message,
            intent=intent,
            profile=profile,
            context_items=context_items,
        )

        return {
            "reply": final_reply.strip(),
            "suggestions": self.build_suggestions(intent),
            "intent": intent,
        }