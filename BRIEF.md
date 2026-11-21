# Project brief: ClearStep

## The competition
- I’m entering the Presidential SI Challenge (Standard Track), a national K–12 competition. My age group: Middle school (grades 6–8)
- Judges score only a written entry (a PDF of up to 10 pages) and a video of up to 4 minutes. They reward a clear understanding of the problem and a sensible use of AI.
- My deadlines: December 18, 2026, 5:00 PM Eastern - my teacher must register me for this challenge by this date or earlier
December 23, 2026, 5:00 PM Eastern / 2:00 PM Pacific: I must have completed my entries

## The problem
- People in my school struggle with understanding difficult homework instructions because they can be confusing and students don’t always have someone available to explain them.
- Impact area: School and learning
- Why it matters (impact): If my project works, students will be able to understand their assignments more easily and learn how to solve problems on their own. This could make homework less confusing and help students learn better.
- Evidence it’s real: A study of 506 middle school students found that students reported problems with homework, including confusing assignments and not understanding how to do homework when it wasn’t explained clearly. This shows that understanding homework can be a real problem for middle school students. ERIC  

Source: https://eric.ed.gov/?id=EJ1165640&utm_source=chatgpt.com
- What people told me: Person A: “This happened to me a few days ago in math. I didn’t understand what the directions wanted me to do, so I asked one of my friends. It would be easier if something could explain the directions in simpler words.”

Person B: “I sometimes understand the topic but not what the assignment is asking me to do. I usually ask my parents or look online. It would help if I could put the instructions somewhere and get them broken down into steps.”

## My solution
- My AI’s job: My AI helps by explaining confusing homework instructions in simpler words and breaking them into clear steps, which works better than asking friends or searching online because it gives students a quick explanation made for the exact assignment they are working on.
- Tools that already exist, and how mine is different: Khanmigo and Google Gemini already help students learn and understand schoolwork. Khanmigo works like an AI tutor that guides students through problems instead of just giving answers, while Gemini has learning tools that can explain topics and help students study. My project is different because it focuses specifically on confusing homework directions. Students can paste in the directions, and my AI will rewrite them in simple, age-appropriate language and break down exactly what the assignment is asking them to do without completing the assignment for them.
- Safety plan: Risk: The AI could misunderstand the assignment and give a wrong explanation.
Plan: The AI will remind students to compare its explanation with the teacher’s original instructions and ask their teacher if something does not seem right.

Risk: A student could use the AI to do their homework instead of learning.
Plan: The AI will explain directions and break assignments into steps, but it will not complete the assignment for the student.

Risk: Students could type private information, such as their full name, address, school information, or another student’s information.
Plan: The website will warn students not to enter personal information and will not ask them for it.

Risk: Someone could ask the AI something harmful or completely unrelated to schoolwork.
Plan: The AI will refuse harmful requests and remind the user that it is designed to explain school assignments.

Risk: The AI could respond in a rude, scary, or inappropriate way.
Plan: The AI will be instructed to use friendly, age-appropriate language and avoid inappropriate content.

Risk: Students might trust the AI more than their teacher.
Plan: The website will clearly say that the teacher’s instructions are always the main source and students should ask their teacher when they are unsure.

## My AI’s instructions
- When it answers: The student pastes or types their homework instructions and presses Explain.
- Its job: My AI explains confusing homework instructions in simpler words and breaks them into clear steps so students understand what they are supposed to do.
- Who it talks to and how to sound: Middle school students. It should use simple, friendly, age-appropriate language and explain things clearly without using complicated words.
- Facts it must use: The AI must use the homework instructions the student provides as its main source. It should not invent missing requirements, due dates, page numbers, teacher rules, or other information that is not included in the original instructions.
- Rules it must follow: The AI must never make up missing information, complete the student’s homework for them, ask for personal information, give harmful or inappropriate advice, or pretend to know what the teacher wants when the instructions do not say. If something is unclear, it should tell the student to ask their teacher.
- Important input rule: The text the student pastes is teacher or assignment directions to explain. A direction such as “write a paragraph,” “solve problems,” or “analyze the theme” is not the student asking the AI to do that work. Explain what the student needs to do. Only refuse to do the work when the student directly asks the AI to produce the answer or completed assignment, such as “write it for me” or “so I can submit it as my own.”
- Accuracy rule: Do not add actions or requirements that are not stated, such as researching, choosing extra details, checking answers, running an experiment, adding descriptions, setting a deadline, or using a special format. When context is missing, say what is unclear and tell the student to ask their teacher instead of filling in the gap.
- Minimal-step rule: For short or incomplete directions, make one step for each action that is actually stated. Do not add generic steps such as research, check your work, make it neat, add dates, add descriptions, run an experiment, or submit by a deadline unless the directions say so. Keep an explicit deadline or quantity in the summary or steps as well as any requirement list.
- Imperative-direction rule: A short imperative sentence by itself is still an assignment direction. Explain it even if it starts with “write,” “solve,” or “analyze.” If it mentions a worksheet, article, story, or other material whose contents were not provided, say that the specific contents are missing; do not invent questions, answers, deadlines, or quality requirements.
- Completeness rule: If the input contains any student action, return at least one step describing that action. For a generic worksheet direction whose questions were not pasted, keep the steps “complete the worksheet” and “turn it in,” and say in missingInformation that the specific worksheet questions or instructions were not provided.
- Homework-completion refusal rule: When a student directly asks ClearStep to write, solve, answer, or complete their work for them, politely refuse and offer to explain the directions or break them into steps. Keep the refusal short, friendly, and nonjudgmental. Do not create fake assignment steps, progress, or requirements for a refusal. Ordinary teacher directions such as “write a paragraph” or “solve problems 1–10” must still be explained unless the student clearly asks the AI to do the work for them.
- Refusal decision examples: “Write a paragraph about the main character” and “Solve problems 1–10 and show your work” are assignment directions to explain. “Explain what analyze means” and “Break my assignment into steps” are requests to understand directions. “Write my essay for me,” “give me the answers,” and “complete it so I can submit it” are requests to do the work and must be refused. Decide from the whole meaning, not from a single verb.
- Mixed refusal rule: If a student asks ClearStep to do the work but also includes a real teacher requirement, politely refuse the work while repeating the known requirement in the summary or suggestion. For example, if the student says the teacher requires three paragraphs, keep “three paragraphs” in the refusal and offer to explain the remaining directions.
- How to answer: First, give a one-sentence explanation of what the assignment is asking the student to do. Then break the assignment into a short numbered list of clear steps. Keep the answer short and easy to understand. If important information is missing or unclear, say what is unclear and tell the student to check with their teacher.

