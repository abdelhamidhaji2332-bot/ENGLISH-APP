// ===== NATIVE LESSON CONTENT (Summaries) =====
// Full Darija explanations available in the English Bdarija guide
const LESSONS_CONTENT = {
  // ========== ENGLISH GRAMMAR SUMMARIES ==========
  tenses: `<h1>Tenses Summary <span class="darija">(الأزمنة)</span></h1>
  <p>8 أزمنة رئيسية فالإنجليزية. التفاصيل الكاملة بالدارجة ف "English Bdarija Guide".</p>
  <table><tr><th>Tense</th><th>Form</th><th>Use</th></tr>
  <tr><td>Present Simple</td><td>V1 (s/es)</td><td>Habits, facts</td></tr>
  <tr><td>Present Continuous</td><td>am/is/are + V-ing</td><td>Now, temporary</td></tr>
  <tr><td>Past Simple</td><td>V2 (-ed/irregular)</td><td>Completed past</td></tr>
  <tr><td>Past Continuous</td><td>was/were + V-ing</td><td>Interrupted action</td></tr>
  <tr><td>Present Perfect</td><td>have/has + V3</td><td>Past → present link</td></tr>
  <tr><td>Past Perfect</td><td>had + V3</td><td>Before another past</td></tr>
  <tr><td>Future Simple</td><td>will + V1</td><td>Predictions, promises</td></tr>
  <tr><td>Future Perfect</td><td>will have + V3</td><td>Complete by future time</td></tr></table>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">شوف English Bdarija Guide للشرح الكامل بالدارجة</a></p>`,

  passive: `<h1>Passive Voice Summary <span class="darija">(المبني للمجهول)</span></h1>
  <p>Object + be (حسب الزمن) + V3 + (by agent).</p>
  <div class="example">Active: The students wrote the essays.<br>Passive: The essays were written by the students.</div>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  "reported-speech": `<h1>Reported Speech Summary <span class="darija">(الكلام المنقول)</span></h1>
  <p>Direct: "I am happy," she said. → Reported: She said that she was happy.</p>
  <p><strong>Backshift:</strong> Present → Past, Past → Past Perfect, will → would</p>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  conditionals: `<h1>Conditionals Summary <span class="darija">(الجمل الشرطية)</span></h1>
  <table><tr><th>Type</th><th>If</th><th>Main</th><th>Example</th></tr>
  <tr><td>Zero</td><td>Present</td><td>Present</td><td>If you heat water, it boils.</td></tr>
  <tr><td>First</td><td>Present</td><td>will + V1</td><td>If it rains, I will stay.</td></tr>
  <tr><td>Second</td><td>Past</td><td>would + V1</td><td>If I had money, I would travel.</td></tr>
  <tr><td>Third</td><td>Past Perfect</td><td>would have + V3</td><td>If I had studied, I'd have passed.</td></tr></table>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  modals: `<h1>Modals Summary <span class="darija">(الأفعال الناقصة)</span></h1>
  <table><tr><th>Modal</th><th>Use</th></tr>
  <tr><td>can</td><td>قدرة / إذن</td></tr>
  <tr><td>could</td><td>قدرة ماضية / طلب مهذب</td></tr>
  <tr><td>may</td><td>إذن / احتمال</td></tr>
  <tr><td>must</td><td>واجب / ضروري</td></tr>
  <tr><td>should</td><td>نصيحة</td></tr></table>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  "relative-pronouns": `<h1>Relative Pronouns Summary <span class="darija">(الضمائر الموصولة)</span></h1>
  <p>who (للناس), which (للحوايج), that (للناس والحوايج), where (فين), whose (ديالو).</p>
  <div class="example">The student who won is my friend.<br>The city where I was born is Fes.</div>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  purpose: `<h1>Purpose Summary <span class="darija">(التعبير عن الهدف)</span></h1>
  <p>to + V1 (باش), in order to (من أجل), so that (حتى), for + noun/gerund (لـ).</p>
  <div class="example">I study hard to pass the BAC.<br>She spoke slowly so that everyone could understand.</div>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  "gerund-infinitive": `<h1>Gerund & Infinitive Summary <span class="darija">(المصدر و الفعل المجرد)</span></h1>
  <p><strong>Gerund (V-ing):</strong> enjoy, avoid, suggest, finish, mind, consider + V-ing</p>
  <p><strong>Infinitive (to + V1):</strong> want, need, hope, plan, decide, promise + to + V1</p>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  "linking-words": `<h1>Linking Words Summary <span class="darija">(كلمات الربط)</span></h1>
  <table><tr><th>Function</th><th>Words</th></tr>
  <tr><td>Addition</td><td>and, moreover, furthermore, also</td></tr>
  <tr><td>Contrast</td><td>but, however, although, whereas</td></tr>
  <tr><td>Cause & Effect</td><td>because, therefore, consequently, so</td></tr>
  <tr><td>Sequence</td><td>first, next, then, finally</td></tr>
  <tr><td>Conclusion</td><td>in conclusion, to sum up, overall</td></tr></table>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">الشرح الكامل بالدارجة ف English Bdarija Guide</a></p>`,

  "phrasal-verbs": `<h1>Phrasal Verbs Summary <span class="darija">(الأفعال المركبة)</span></h1>
  <p>give up (يستسلم), look after (يعتني), put off (يؤجل), turn down (يرفض), come across (يصادف), run out of (ينفد), carry out (ينفذ), break down (يتعطل).</p>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">كل التفاصيل بالدارجة ف English Bdarija Guide</a></p>`,

  functions: `<h1>Functions Summary <span class="darija">(الوظائف اللغوية)</span></h1>
  <p>10 وظائف رئيسية للباك: إبداء الرأي، طلب التوضيح، التعبير عن الهدف، السبب والنتيجة، الإضافة والامتياز، الشكوى والاعتذار، النصيحة، الأخبار الجيدة والسيئة، اليقين والشك، الندم.</p>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">التفاصيل الكاملة ف English Bdarija Guide</a></p>`,

  writing: `<h1>Writing Summary <span class="darija">(دليل الكتابة)</span></h1>
  <p>Introduction + Body (2-3 paragraphs) + Conclusion. استعمل linking words و rich vocabulary.</p>
  <p>📘 <a href="#" onclick="openLessonOverlay('bac-english-bdarija.html');return false;" style="color:#f59e0b;">جميع أنواع الكتابة مع الشرح ف English Bdarija Guide</a></p>`,

};
