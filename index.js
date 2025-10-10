window.currentRecordId = null;
window.addEventListener('load', getTitles);

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = ''; // Required for modern browsers
});


const basePromptStart = {
  en: "Instructions: REMEMBER NOT TO INCLUDE SYSTEM DIALOGUE LIKE \"The post is:\" OR \"Task number 3:\" JUST OUTPUT THE ACTUAL ENHANCED POST. You will receive a text and must slightly and naturally edit it and add the following:\n\n",
  de: "Anweisungen: DENKE DARAN, KEINE SYSTEMDIALOGE WIE „Der Beitrag lautet:“ ODER „Aufgabe Nummer 3:“ EINZUFÜGEN, SONDERN NUR DEN TATSÄCHLICH ÜBERARBEITETEN BEITRAG AUSZUGEBEN. Du erhältst einen Text und musst ihn leicht und natürlich überarbeiten und Folgendes hinzufügen:\n\n"
};

const basePromptEnd = {
  en: "Final Task: there is a writing style commonly used by AI where dashes/minus signs (\"-\") are used to separate words, example: \"the problem is-that this doesn't work\". The dash is not there to represent the start of a category, or a negative number, like the regular use cases, instead it is there to be an alternative to the comma, this is BAD, we dont want this, remove all of these comma replacer dashes and replace them with actual commas. Now you've received your instructions, here is the ACTUAL CONTENT TO ENHANCE:\n\n",
  de: "Abschließende Aufgabe: Es gibt einen von KI häufig verwendeten Schreibstil, bei dem Bindestriche/Minuszeichen („-“) verwendet werden, um Wörter zu trennen, Beispiel: „das Problem ist-dass das nicht funktioniert“. Der Bindestrich steht dabei nicht für den Beginn einer Kategorie oder eine negative Zahl, wie in den regulären Anwendungsfällen, sondern dient als Ersatz für ein Komma. Das ist SCHLECHT, das wollen wir nicht. Entferne alle diese als Komma-Ersatz verwendeten Bindestriche und ersetze sie durch echte Kommata. Jetzt hast du deine Anweisungen erhalten, hier ist der TATSÄCHLICHE INHALT ZUR ÜBERARBEITUNG:\n\n"
};

const toggleInstructions = {
  emojis: {
    en: "Task: Add professional and engaging emojis: Add appropriate emojis that enhance readability and engagement while maintaining a professional tone. Best practices for LinkedIn emojis: Use sparingly, not too many emojis for most posts. Place at the beginning of key points or sections. Use to replace bullet points or highlight important concepts. Avoid overuse - one emoji per paragraph/section is usually enough. Choose professional, universally understood emojis. Don't add emojis to every single line. Focus on business-appropriate emojis: Target/goal symbols for objectives. Growth/chart symbols for metrics and progress. Lightning/rocket symbols for speed and innovation. Key/lightbulb symbols for insights. Check marks for completed items or benefits. Avoid overly casual or emotional emojis that might seem unprofessional in a business context. Your output should be the same post with strategically placed emojis that are relevant and enhance the post.\n\n",
    de: "Aufgabe: Füge professionelle und ansprechende Emojis hinzu Füge passende Emojis hinzu, die die Lesbarkeit und das Engagement verbessern, dabei jedoch einen professionellen Ton beibehalten Best Practices für LinkedIn-Emojis Verwende Emojis sparsam, nicht zu viele Emojis für die meisten Beiträge Platziere sie am Anfang wichtiger Punkte oder Abschnitte Verwende sie als Ersatz für Aufzählungszeichen oder zur Hervorhebung wichtiger Konzepte Vermeide Überbenutzung – ein Emoji pro Absatz/Abschnitt ist in der Regel ausreichend Wähle professionelle, allgemein verständliche Emojis Füge nicht jeder einzelnen Zeile ein Emoji hinzu Konzentriere dich auf geschäftlich passende Emojis Ziel- oder Zielsymbole für Zielsetzungen Wachstums- oder Diagrammsymbole für Kennzahlen und Fortschritt Blitz- oder Raketensymbole für Geschwindigkeit und Innovation Schlüssel- oder Glühbirnensymbole für Erkenntnisse Häkchen für erledigte Punkte oder Vorteile Vermeide allzu lässige oder emotionale Emojis, die im geschäftlichen Kontext unprofessionell wirken könnten Deine Ausgabe sollte derselbe Beitrag mit strategisch platzierten Emojis sein, die relevant sind und den Beitrag aufwerten\n\n"
  },
  cta: {
    en: "Task: Add a compelling call to action: Add a strong, engaging call to action at the end that motivates readers to interact, follow, or engage with the content. Types of effective CTAs: Direct engagement requests - ask readers to comment, share, or follow. Thought-provoking questions - pose interesting questions that spark discussion and comments. Experience sharing - invite readers to share their own related experiences or opinions. Value-driven actions - encourage actions that benefit the reader like saving the post or connecting. Make your CTA: Relevant to the post content. Specific rather than generic. Conversational and natural. Easy to act on. Genuinely interesting or valuable to the reader. CTA approaches: Ask about their experience with the topic. Pose a debate-worthy question. Request they share their perspective. Invite them to follow for more insights on the topic. Ask them to share if they found it valuable. Challenge them with a thought-provoking scenario.\n\n",
    de: "Aufgabe: Füge einen überzeugenden Call-to-Action hinzu Füge am Ende einen starken, ansprechenden Call-to-Action hinzu, der die Leser motiviert zu interagieren, zu folgen oder sich mit dem Inhalt auseinanderzusetzen Arten effektiver CTAs Direkte Aufforderungen zur Interaktion – bitte die Leser zu kommentieren, zu teilen oder zu folgen Zum Nachdenken anregende Fragen – stelle interessante Fragen, die Diskussionen und Kommentare anregen Erfahrungsaustausch – lade die Leser ein, eigene relevante Erfahrungen oder Meinungen zu teilen Wertorientierte Handlungen – ermutige zu Aktionen, die dem Leser nutzen, wie das Speichern des Beitrags oder das Vernetzen Gestalte deinen CTA Relevant zum Inhalt des Beitrags Spezifisch statt allgemein Gesprächig und natürlich Einfach umzusetzen Wirklich interessant oder wertvoll für den Leser CTA-Ansätze Frage nach ihren Erfahrungen mit dem Thema Stelle eine diskussionswürdige Frage Bitte um das Teilen ihrer Perspektive Lade zum Folgen für weitere Einblicke zum Thema ein Bitte um Teilen, wenn sie den Beitrag hilfreich fanden Fordere sie mit einem zum Nachdenken anregenden Szenario heraus\n\n"
  },
  facts: {
    en: "TASK: Enhance existing content with embedded facts and links. You will receive a piece of content (topic, story, or post). Your job is to take that EXACT content and subtly enhance it by inserting relevant statistics, facts, and links where they naturally fit. What to do: -Keep the original text 95% unchanged. -Add 2-4 factual enhancements by inserting them directly into the existing sentences or paragraphs. -Insert real links to credible sources where relevant. -Make additions feel natural, like they were always part of the original content. -What NOT to do: -DO NOT TYPE This is the hook for the post: or here are the facts and links:, just output the enhanced text. -Don't create a separate fact-checking section. -Don't rewrite the entire post. -Don't add headers like Sources: or Verification:. -Don't make a list of citations at the end. -Don't change the tone or style of the original. -How to insert facts: -Add statistics naturally: ...this trend is growing, it's up 23% since 2022, according to Reuters... -Insert supporting links naturally: ...as reported by the Wall Street Journal... -Weave in relevant data mid-sentence: ...affecting millions of people, studies show over 40% experience this... -Example: -Original: (Remote work is becoming more popular.). -Enhanced: (Remote work is becoming more popular, with 35% of workers now working remotely at least part-time, according to a 2024 Gallup survey.). -Your output should look like the original content but with a few smart additions embedded naturally throughout.\n\n",
    de: "AUFGABE: Bestehende Inhalte mit eingebetteten Fakten und Links verbessern Du erhältst einen Inhalt (Thema, Geschichte oder Beitrag) Deine Aufgabe ist es, diesen GENAUEN Inhalt subtil zu verbessern, indem du relevante Statistiken, Fakten und Links dort einfügst, wo sie natürlich passen Was zu tun ist Behalte den Originaltext zu 95 % bei Füge 2–4 sachliche Ergänzungen direkt in die bestehenden Sätze oder Absätze ein Füge echte Links zu glaubwürdigen Quellen ein, wo relevant Lass die Ergänzungen natürlich wirken, als wären sie schon immer Teil des ursprünglichen Inhalts gewesen Was NICHT zu tun ist Schreibe NICHT Dies ist der Aufhänger für den Beitrag oder hier sind die Fakten und Links gib einfach den verbesserten Text aus Erstelle keinen separaten Abschnitt zur Faktenprüfung Schreibe den gesamten Beitrag nicht neu Füge keine Überschriften wie Quellen oder Verifizierung hinzu Mache am Ende keine Liste mit Quellenangaben Ändere nicht den Ton oder Stil des Originals So werden Fakten eingefügt Füge Statistiken natürlich ein …dieser Trend wächst, er ist seit 2022 um 23 % gestiegen, laut Reuters… Füge unterstützende Links natürlich ein …wie im Wall Street Journal berichtet… Baue relevante Daten mitten im Satz ein …betroffen sind Millionen Menschen, Studien zeigen dass über 40 % dies erleben… Beispiel Original Fernarbeit wird immer beliebter Verbesserte Version Fernarbeit wird immer beliebter, mit 35 % der Arbeitnehmer, die laut einer Gallup-Umfrage von 2024 zumindest teilweise remote arbeiten Dein Ergebnis sollte wie der Originaltext aussehen, jedoch mit ein paar klug eingebetteten Ergänzungen\n\n"
  },
  hotTakes: {
    en: "Task: add ONE OR TWO thought-provoking, slightly controversial unpopular opinions/hot takes sprinkled in naturally that will engage readers and spark discussion. The goal is to challenge conventional thinking while staying logical. For NO MORE THAN ONE TIME, you can preface it by saying something like hot take: (actual hot take here) to let people know its a hot take and get their attention. Guidelines: Stay professional but provocative. Back up controversial claims with logic. Target practices, not people. Make readers think hmm, they might be right. Avoid politics, religion, or personal attacks. Keep it industry/business focused. Make it debatable but defendable\n\n",
    de: "Aufgabe: Füge EIN ODER ZWEI zum Nachdenken anregende, leicht kontroverse und unpopuläre Meinungen oder Hot Takes ein, die auf natürliche Weise eingebaut sind und Leser zum Mitdiskutieren anregen. Ziel ist es, konventionelles Denken herauszufordern, dabei aber logisch zu bleiben. Du darfst MAXIMAL EINMAL einen solchen Gedanken mit etwas wie Hot Take: (tatsächlicher Hot Take) einleiten, um Aufmerksamkeit zu erzeugen. Richtlinien: Bleibe professionell, aber provokativ. Stütze kontroverse Aussagen mit Logik. Kritisiere Praktiken, nicht Personen. Bringe Leser dazu zu denken hmm, vielleicht haben sie recht. Vermeide Politik, Religion oder persönliche Angriffe. Bleibe auf Industrie- bzw. Geschäftsthemen fokussiert. Mache es diskutierbar, aber verteidigbar.\n\n"
  }
};

async function getTitles() {
  const dropdown = document.getElementById('dropdowntitles');
  dropdown.innerHTML = ''; // Clear existing options

  try {
    const response = await fetch('https://n8n.enhanced-tech.de/webhook/get-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_loaded' })
    });

    if (response.status === 295) {
      const flatData = await response.json();
      console.log(flatData);

      const titles = [];

      for (let i = 1; i <= 200; i++) {
        const input = flatData[`Input${i}`];
        const id = flatData[`id${i}`];
        const created = flatData[`createdTime${i}`];
        if (!id) continue;

        const display = input?.trim() === '' ? '[EMPTY]' : input;
        titles.push({ Input: display, id, createdTime: created });
      }

      // ✅ Add placeholder first
      const placeholder = document.createElement('option');
      placeholder.textContent = 'Select a previous input...';
      placeholder.value = '__placeholder__';
      placeholder.disabled = true;
      placeholder.selected = true;
      dropdown.appendChild(placeholder);

      // ✅ Add actual options
      titles.forEach(item => {
        const option = document.createElement('option');
        const truncated = item.Input.length > 80 ? item.Input.slice(0, 77) + '...' : item.Input;
        option.textContent = truncated;
        option.title = item.Input;
        option.value = item.id;
        option.setAttribute('data-id', item.id);
        option.setAttribute('data-created', item.createdTime);
        dropdown.appendChild(option);
      });
    }

  } catch (error) {
    console.error('Error fetching titles:', error);
    document.getElementById('textResult').value = 'Error loading titles.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateSecondaryPrompt();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dropdowntitles').addEventListener('change', async function () {
    const selectedOption = this.options[this.selectedIndex];
    const selectedId = selectedOption.value;
    window.currentRecordId = selectedId;

    if (!selectedId) return;

    try {
      const response = await fetch('https://n8n.enhanced-tech.de/webhook/get-latest-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId })
      });

      if (response.status === 298) {
        const result = await response.json();

        // ✅ Always show the full original input
        const fullInput = selectedOption.title || result.Input;

        document.getElementById('textResult').value = result.Content || 'No content';
        if (!document.getElementById('lock-textInput').checked) {
          document.getElementById('textInput').value = fullInput || 'No content';
        }
        if (!document.getElementById('lock-promptInput').checked) {
          document.getElementById('promptInput').value = result.MainPrompt || 'No content';
        }
        if (!document.getElementById('lock-secondpromptInput').checked) {
          document.getElementById('secondpromptInput').value = result.SecondaryPrompt || 'No content';
        }
        console.log("Loaded:", result);
        document.getElementById('dropdowntitles').value = '__placeholder__';
      }

    } catch (error) {
      console.error('Error fetching single title:', error);
      document.getElementById('textResult').value = 'Error retrieving post.';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dropdown').addEventListener('change', async function () {
    const selectedOption = this.options[this.selectedIndex].value;
    const isGerman = document.getElementById('germanToggle').checked;

    window.currentRecordId = '';
    document.getElementById('dropdowntitles').value = '__placeholder__';
    if (!document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = '';
    }
    const lang = isGerman ? 'de' : 'en';

    if (selectedOption === 'Business' && !document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = promptBusiness[lang];
    } else if (selectedOption === 'Narrative' && !document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = promptNarrative[lang];
    } else if (selectedOption === 'Business10' && !document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = promptBusiness10[lang];
    } else if (selectedOption === 'Wehelpyou' && !document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = promptWehelpyou[lang];
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('custom-prompt').addEventListener('change', function () {
    const dropdown = document.getElementById('dropdown');
    
    if (this.checked && document.getElementById('custom-prompt2').checked) {
      dropdown.disabled = true;                  // Disable the dropdown
      dropdown.classList.add('disabled-style');  // Add gray-out style
    } else {
      dropdown.disabled = false;                 // Enable it again
      dropdown.classList.remove('disabled-style');
    }
  });
});

async function postText() {
  const text = document.getElementById('textInput').value;
  const prompt = document.getElementById('promptInput').value;
  const prompt2 = document.getElementById('secondpromptInput').value;
  const selectedDropdown = document.getElementById('dropdown').value;
  // const images = document.getElementById('imageGallery').value;

  const button = document.getElementById('postTextBtn');
  button.classList.add('loading');

  const timeout = setTimeout(() => {
    button.classList.remove('loading');
    alert("⚠️ This is taking longer than expected (45s). Try again later.");
  }, 45000);

  const formData = {
    text: text,
    dropdown: selectedDropdown,
    emojis: document.getElementById('emojis').checked.toString(),
    cta: document.getElementById('cta').checked.toString(),
    facts: document.getElementById('facts').checked.toString(),
    // longPost: document.getElementById('longPost').checked.toString(),
    hotTakes: document.getElementById('hotTakes').checked.toString(),
    // clickbait: document.getElementById('clickbait').checked.toString(),
    german: document.getElementById('germanToggle').checked.toString(),
    images: document.getElementById('images').checked.toString(),
    customPrompt: document.getElementById('custom-prompt').checked.toString(),
    customPrompt2: document.getElementById('custom-prompt2').checked.toString(),
    prompt: prompt,
    prompt2: prompt2
  };
  document.getElementById('dropdowntitles').value = '__placeholder__';  
  document.getElementById('textResult').value = '';  
  
  try {
    // const response = await fetch('https://n8n.enhanced-tech.de/webhook/generate-from-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });

    if (response.status === 299) {

      const json = await response.json();
      console.log(json);
      const dataArray = Array.isArray(json) ? json : [json];

      // text message
      const metadata = dataArray.find(item => item.Content && item.id);
      if (metadata?.id && metadata.Input !== undefined) {
          const dropdown = document.getElementById('dropdowntitles');
          
          const option = document.createElement('option');
          const display = metadata.Input?.trim() === '' ? '[EMPTY]' : metadata.Input;
          const truncated = display.length > 80 ? display.slice(0, 77) + '...' : display;

          option.textContent = truncated;
          option.title = display;
          option.value = metadata.id;
          option.setAttribute('data-id', metadata.id);
          option.setAttribute('data-created', metadata.createdTime || new Date().toISOString());

          // Add it to the top (after placeholder)
          dropdown.insertBefore(option, dropdown.options[1]);

          // Select it as current
          dropdown.value = metadata.id;

          // Also update the currentRecordId
          window.currentRecordId = metadata.id;

          clearTimeout(timeout);
          button.classList.remove('loading');

          dropdown.value = '__placeholder__';
          document.getElementById('textResult').value = metadata?.Content || 'No content';
          if (!document.getElementById('lock-promptInput').checked) {
            document.getElementById('promptInput').value = metadata?.MainPrompt || '';
          }
          if (!document.getElementById('lock-secondpromptInput').checked) {
          document.getElementById('secondpromptInput').value = metadata?.SecondaryPrompt || '';
          }
        }



      // images
      const imageGallery = document.getElementById('imageGallery');
      imageGallery.innerHTML = '';

      for (let i = 1; i <= 10; i++) {
        const url = json[`url${i}`];
        const alt = json[`alt${i}`];
        if (url && alt) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = alt;
          img.style.maxWidth = '150px';
          img.style.margin = '5px';
          imageGallery.appendChild(img);
        }
      }
    }
  } catch (error) {
    clearTimeout(timeout);
    button.classList.remove('loading');    
    console.error('Error receiving content:', error);
    document.getElementById('textResult').value = 'Error retrieving content.';
  }
}

function updateSecondaryPrompt() {
  let instructions = "";

  ['emojis', 'cta', 'facts', 'hotTakes'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox && checkbox.checked) {
      const lang = document.getElementById('germanToggle').checked ? 'de' : 'en';
      instructions += toggleInstructions[id][lang] + '\n';
    }
  });

  const lang = document.getElementById('germanToggle').checked ? 'de' : 'en';
  if (!document.getElementById('lock-secondpromptInput').checked) {
    document.getElementById('secondpromptInput').value =
      basePromptStart[lang] + '\n\n' +
      instructions +
      '\n\n' +
      basePromptEnd[lang];
  }
}

async function fetchImages() {
  const searchTerm = document.getElementById('textImageInput').value;

  const formData = {
    searchTerm: searchTerm
  };

  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/unsplash-image-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });

    if (response.status === 293) {
      let json = await response.json();
      console.log(json);

      const dataArray = Array.isArray(json) ? json : (json.body ?? [json]);
      console.log(dataArray);

      const gallery = document.getElementById('imageGallery');
      gallery.innerHTML = '';

      dataArray.forEach(img => {
        const card = document.createElement('div');
        card.className = 'card';

        const image = document.createElement('img');
        image.src = img.url;
        image.alt = img.alt || '';
        image.className = 'card-img';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '📋';
        copyBtn.onclick = () => copyToClipboard(img.url);

        card.appendChild(image);
        card.appendChild(copyBtn);
        gallery.appendChild(card);
      });

    };

  } catch (error) {
    console.error('Error fetching images:', error);
    document.getElementById('imageGallery').innerHTML = '<p>Error retrieving images.</p>';
  }
}

async function continueAI(inputName) {
  let promptElement;
  let lockCheckbox;
  let promptType;

  if (inputName === 'input') {
    promptElement = document.getElementById('textInput');
    lockCheckbox = document.getElementById('lock-textInput');
    promptType = 'input';
  } else if (inputName === 'result') {
    promptElement = document.getElementById('textResult');
    promptType = 'result';
  } else if (inputName === 'prompt') {
    promptElement = document.getElementById('promptInput');
    lockCheckbox = document.getElementById('lock-promptInput');
    promptType = 'prompt';
  } else if (inputName === 'prompt2') {
    promptElement = document.getElementById('secondpromptInput');
    lockCheckbox = document.getElementById('lock-secondpromptInput');
    promptType = 'prompt2';
  } else {
    console.error('Invalid inputName passed to continueAI');
    return;
  }

  // Prevent continuation if locked
  if (lockCheckbox?.checked) {
    console.warn(`"${promptType}" is locked and cannot be continued.`);
    return;
  }

  const promptText = promptElement.value;

  const formData = {
    content: promptText,
    type: promptType
  };

  try {
    const response = await fetch('https://n8n.enhanced-tech.de/webhook/continue-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.status === 292) {
      const json = await response.json();
      const continuation = json.message.content || '[No content received]';

      promptElement.value += continuation;
    }

  } catch (error) {
    console.error('Error continuing text with AI:', error);
  }
}


async function generateAI(inputName) {
  let targetElement;
  let lockCheckbox;
  let promptType;

  if (inputName === 'input') {
    targetElement = document.getElementById('textInput');
    lockCheckbox = document.getElementById('lock-textInput');
    promptType = 'input';
  } else if (inputName === 'result') {
    targetElement = document.getElementById('textResult');
    promptType = 'result';
  } else if (inputName === 'prompt') {
    targetElement = document.getElementById('promptInput');
    lockCheckbox = document.getElementById('lock-promptInput');
    promptType = 'prompt';
  } else if (inputName === 'prompt2') {
    targetElement = document.getElementById('secondpromptInput');
    lockCheckbox = document.getElementById('lock-secondpromptInput');
    promptType = 'prompt2';
  } else {
    console.error('Invalid inputName passed to generateAI');
    return;
  }

  // Prevent overwrite if locked
  if (lockCheckbox?.checked) {
    console.warn(`"${promptType}" is locked and cannot be overwritten.`);
    return;
  }

  const formData = {
    type: promptType
  };

  try {
    const response = await fetch('https://n8n.enhanced-tech.de/webhook/generate-new-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.status === 294) {
      const json = await response.json();
      const newText = json.Content || '[No content returned]';

      targetElement.value = newText;
    } else {
      console.error('Unexpected response status:', response.status);
    }

  } catch (error) {
    console.error('Error generating new AI text:', error);
  }
}



async function deleteRecord() {
  if (!currentRecordId) {
    document.getElementById('textResult').value = '';
    if (!document.getElementById('lock-textInput').checked) {
      document.getElementById('textInput').value = '';
    }
    if (!document.getElementById('lock-promptInput').checked) {
      document.getElementById('promptInput').value = '';
    }
    if (!document.getElementById('lock-secondpromptInput').checked) {
      document.getElementById('secondpromptInput').value = '';
    }
    alert('No record selected, only locally deleted.');
    return;
  }

  const formData = {
    id: window.currentRecordId
  };

  try {
    const response = await fetch('https://n8n.enhanced-tech.de/webhook/delete-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });

    if (response.status === 291) {
      const dropdown = document.getElementById('dropdowntitles');
      const indexToRemove = [...dropdown.options].findIndex(
        option => option.value === currentRecordId
      );

      if (indexToRemove !== -1) {
        dropdown.remove(indexToRemove);
      }

      document.getElementById('textResult').value = '';
      if (!document.getElementById('lock-textInput').checked) {
        document.getElementById('textInput').value = '';
      }
      if (!document.getElementById('lock-promptInput').checked) {
        document.getElementById('promptInput').value = '';
      }
      if (!document.getElementById('lock-secondpromptInput').checked) {
        document.getElementById('secondpromptInput').value = '';
      }

      currentRecordId = null;

      dropdown.value = '__placeholder__';

      console.log('Record deleted and removed from UI.');
    }

  } catch (error) {
    console.error('Error deleting record:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ['emojis', 'cta', 'facts', 'hotTakes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSecondaryPrompt);
  });
  
  document.getElementById('custom-prompt2').addEventListener('change', () => {
    if (!document.getElementById('custom-prompt2').checked) {
      updateSecondaryPrompt();
    }
  });
});




[
  { "url": "https://lenyes346.app.n8n.cloud/workflow/20jTer0mQUOZCvsn", "alt": "..." },
  { "url": "http://localhost:81", "alt": "..." }
]

const promptBusiness = {
  en: `# Task: Write LinkedIn Business Posts Using Professional Style Analysis

You will create LinkedIn business posts by first analyzing successful professional writing patterns, then developing your own structure and approach for the given topic.

## **STYLE REFERENCE ANALYSIS:**

Based on successful LinkedIn business content, here are common characteristics you may consider:

### **Potential Opening Approaches:**
- Provocative questions or contrarian statements
- Personal experience hooks ("This week I..." "A highlight was...")
- Challenge assumptions or conventional wisdom
- Surprising insights about common problems

### **Possible Content Organization:**
- Multi-perspective breakdowns (business/functional/technical angles)
- Before/after comparisons or mindset shifts
- Problem-solution narratives with personal context
- Industry observations with broader implications

### **Style Elements to Consider:**
- **Tone:** Professional yet conversational, confident but relatable
- **Structure:** Mix of short punchy statements and longer explanatory paragraphs, but never too long, mostly 1-2 lines at a time separated by one or two new lines to make the text look easier to read,
- **Formatting:** Strategic use of line breaks and emphasis
- **Perspective:** Include multiple viewpoints or stakeholder angles
- **Connection:** Use "we/us/you" language to create relatability

### **Engagement Techniques:**
- Reference conversations, meetings, or recent experiences
- Include analogies from everyday life
- Address common frustrations or challenges
- End with memorable principles or actionable insights

## **YOUR TASK:**

1. **Analyze the given topic** and determine what aspect would be most valuable to discuss

2. **Choose your own structure** - don't follow a rigid template, but create an approach that fits the content naturally

3. **Develop your angle** - what's your unique perspective or insight on this topic?

4. **Write authentically** - sound like a knowledgeable professional sharing genuine thoughts

5. **Make it engaging** - consider what would make your target audience stop scrolling and engage

## **FLEXIBILITY GUIDELINES:**

- **Adapt your approach** to the specific topic - some may need storytelling, others need analysis
- **Find your voice** - be professional but let personality show through
- **Structure for impact** - organize content in whatever way serves your message best
- **End purposefully** - conclude in a way that fits your content (question, insight, call to action)

## **QUALITY MARKERS:**

Your post should feel:
- Authentic and experience-based
- Professionally valuable 
- Conversationally engaging
- Structurally clear
- Memorable or thought-provoking

---

**Topic for your LinkedIn post:** `,
  de: `Aufgabe: Verfassen von LinkedIn-Business-Posts mithilfe professioneller Stil-Analyse
Du wirst LinkedIn-Business-Posts erstellen, indem du zunächst erfolgreiche Muster professionellen Schreibens analysierst und anschließend deine eigene Struktur und Herangehensweise für das jeweilige Thema entwickelst.

STILANALYSE – REFERENZ:
Basierend auf erfolgreichen LinkedIn-Business-Beiträgen findest du hier typische Merkmale, die du berücksichtigen kannst:

Mögliche Einstiegsansätze:
Provokante Fragen oder konträre Aussagen

Persönliche Aufhänger ("Diese Woche habe ich..." „Ein Highlight war...“)

Infragestellen von Annahmen oder gängiger Denkweisen

Unerwartete Erkenntnisse zu alltäglichen Problemen

Mögliche Strukturierung des Inhalts:
Mehrperspektivische Betrachtungen (Business-/Fach-/Technik-Sicht)

Vorher-Nachher-Vergleiche oder mentale Perspektivwechsel

Problem-Lösungs-Erzählungen mit persönlichem Bezug

Branchenbeobachtungen mit größerer Tragweite

Stilelemente zur Beachtung:
Tonfall: Professionell, aber nahbar; selbstbewusst, aber nicht überheblich

Struktur: Mischung aus kurzen, pointierten Aussagen und etwas längeren erklärenden Absätzen – aber nie zu lang; idealerweise 1–2 Zeilen pro Abschnitt, getrennt durch ein oder zwei Leerzeilen, um die Lesbarkeit zu verbessern

Formatierung: Gezielter Einsatz von Zeilenumbrüchen und Hervorhebungen

Perspektive: Verschiedene Sichtweisen oder Stakeholder-Perspektiven einbeziehen

Bezug zum Leser: Verwende Sprache wie „wir/uns/du“, um Nähe und Relevanz herzustellen

Techniken zur Steigerung der Aufmerksamkeit:
Bezüge zu Gesprächen, Meetings oder aktuellen Erlebnissen

Alltagsanalogie zur Veranschaulichung

Ansprache typischer Frustrationen oder Herausforderungen

Abschluss mit einer prägnanten Erkenntnis oder einer umsetzbaren Idee

DEINE AUFGABE:
Analysiere das vorgegebene Thema und entscheide, welcher Aspekt besonders relevant und wertvoll für die Zielgruppe ist

Wähle eine passende Struktur – folge keinem starren Template, sondern finde eine natürliche Herangehensweise, die zum Inhalt passt

Entwickle deinen eigenen Blickwinkel – was ist deine besondere Perspektive oder Erkenntnis zum Thema?

Schreibe authentisch – klinge wie eine fachkundige Person, die echte Gedanken teilt

Gestalte den Beitrag ansprechend – überlege, was deine Zielgruppe zum Innehalten und Mitdenken bewegt

FLEXIBILITÄTSLEITLINIEN:
Passe deine Herangehensweise dem jeweiligen Thema an – manche brauchen eine Geschichte, andere eine Analyse

Finde deine Stimme – sei professionell, aber zeige Persönlichkeit

Strukturiere wirkungsvoll – ordne den Inhalt so, dass er deine Botschaft bestmöglich transportiert

Beende bewusst – der Abschluss soll zum Inhalt passen (Frage, Erkenntnis, Handlungsaufforderung etc.)

QUALITÄTSMERKMALE:
Dein Beitrag sollte sich so anfühlen:

Authentisch und erfahrungsbasiert

Beruflich wertvoll

Nahbar und dialogfähig

Klar strukturiert

Einprägsam oder zum Nachdenken anregend

Thema für deinen LinkedIn-Post:`
};

const promptNarrative = {
  en: `# Task: Create a relatable personal anecdote using 5-act narrative structure  You will receive a topic or theme. Generate a first-person anecdote that feels like a real personal memory someone might share in conversation, structured as a compelling narrative arc that ends with a powerful message/insight. Write the whole post like you would a LinkedIn post.  ## Your anecdote should:  - Be written in first person ("I remember..." "I was..." "My friend and I...") - Feel like an ordinary but memorable moment from everyday life - Include specific sensory details and emotions without being overly dramatic - Avoid revealing specific dates, exact locations, full names, or overly unique circumstances - Be relatable - something that could happen to many people - Follow the 5-act narrative structure below  ## Keep it believable by:  - Using vague time references ("a few years ago," "when I was younger," "last summer") - Mentioning general locations ("at a coffee shop," "in my neighborhood," "at work") - Try not to include dialogue jokes - Focusing on universal emotions and experiences, don't sound too technical - Avoiding anything too coincidental or dramatic  ## 5-Act Narrative Structure:  ### 1. **EXPOSITION** (Scene Setting) - Establish the ordinary context, time, place, and situation - Set the "normal" baseline before things change - Make it relatable and mundane - *Example: "I was settling into my usual routine at the computer..."*  ### 2. **CONFLICT/INCITING INCIDENT** (The Problem) - Something unexpected, challenging, curious, sad, or mysterious happens - Express your genuine emotions and initial reaction - This doesn't have to be dramatic - small conflicts work best - Show vulnerability and authenticity - *Example: "Then I overheard a conversation that completely shifted my perspective..."*  ### 3. **ACTION/RISING ACTION** (Your Response) - Describe what you decided to do about the conflict - Show your thought process and decision-making - This could be a right or wrong choice - both work for learning - Include internal struggle or hesitation if relevant - *Example: "I knew I had to speak up, even though every instinct told me to stay quiet..."*  ### 4. **RESULTS/CONSEQUENCES** (What Happened) - Did your action work? Did it fail? Was it mixed? - Show the immediate aftermath and your reaction to it - Include both intended and unintended consequences - Be honest about success or failure - *Example: "The response wasn't what I expected - it actually made things worse at first..."*  ### 5. **RESOLUTION/LESSON** (The Insight) - What did you learn from this experience? - How did it change your perspective or approach? - Connect to a broader professional or life principle - Make it actionable for your audience  ## Formatting Guidelines: - Use short, easy-to-read sentences spaced out by 1-2 new lines - Add **bold text**, and other engaging syntax, but don't overdo it - Include bullet points (→) for key insights when appropriate  ## Tone:  Conversational and authentic, like you're telling a friend about something that genuinely stuck with you. Show vulnerability while maintaining professionalism.  ## Example Structure Flow: "A few months ago, I was [EXPOSITION: normal situation]...  But then [CONFLICT: something unexpected happened] and I felt [emotion]...  So I decided to [ACTION: what you did about it]...  The result? [CONSEQUENCES: what actually happened]...  Looking back, I realized [LESSON: the insight/learning]...  **Topic to use:** `,
  de: `Aufgabe: Erzähle eine nachvollziehbare persönliche Anekdote anhand der 5-Akt-Struktur
Du erhältst ein Thema oder eine übergeordnete Idee. Erstelle daraus eine Ich-Erzählung, die wie eine echte persönliche Erinnerung wirkt – so, wie man sie im Gespräch mit jemandem teilen würde. Der Text soll wie ein LinkedIn-Post geschrieben sein und einem spannenden, klar aufgebauten Erzählbogen folgen, der mit einer kraftvollen Botschaft oder Einsicht endet.

Deine Anekdote sollte:
In der Ich-Form geschrieben sein („Ich erinnere mich...“, „Ich war...“, „Meine Freundin und ich...“)

Wie ein ganz normaler, aber einprägsamer Moment aus dem Alltag wirken

Konkrete Sinneseindrücke und Emotionen enthalten, ohne übertrieben dramatisch zu sein

Keine exakten Daten, Orte, vollen Namen oder allzu außergewöhnliche Umstände nennen

Nachvollziehbar sein – etwas, das vielen Menschen passieren könnte

Der folgenden 5-Akt-Erzählstruktur folgen

So bleibt deine Geschichte glaubwürdig:
Verwende vage Zeitangaben („vor ein paar Jahren“, „als ich jünger war“, „letzten Sommer“)

Erwähne nur allgemeine Orte („in einem Café“, „in meiner Nachbarschaft“, „bei der Arbeit“)

Vermeide Dialog-Witze oder übertriebene Pointen

Fokussiere dich auf universelle Gefühle und Erfahrungen, bleib bodenständig

Vermeide zufällige oder übermäßig dramatische Zufälle

5-Akt-Erzählstruktur:
1. EXPOSITION (Szene & Ausgangslage)
Beschreibe den ganz normalen Kontext: Zeit, Ort, Situation

Stelle die gewohnte Ausgangssituation dar – bevor sich etwas verändert

Mach es alltäglich, nachvollziehbar

Beispiel: „Ich war gerade dabei, meinen gewohnten Arbeitsrhythmus am Laptop aufzunehmen…“

2. KONFLIKT / AUSLÖSENDES EREIGNIS
Etwas Unerwartetes, Herausforderndes, Trauriges oder Irritierendes passiert

Zeige deine echten Emotionen und erste Reaktion

Es muss nicht dramatisch sein – kleine Konflikte wirken oft stärker

Verletzlichkeit und Echtheit machen den Unterschied

Beispiel: „Dann hörte ich ein Gespräch mit, das meine Sicht auf die Dinge völlig veränderte…“

3. HANDLUNG / SPANNUNGSAUFBAU
Was hast du aufgrund des Konflikts unternommen?

Zeige deine Gedanken, Abwägungen, vielleicht auch Zweifel

Egal ob richtige oder falsche Entscheidung – beides ist lehrreich

Beispiel: „Ich wusste, dass ich etwas sagen musste – auch wenn mir alles in mir sagte, ich solle lieber still sein…“

4. FOLGEN / ERGEBNIS
Hat dein Handeln funktioniert? Oder nicht? Oder nur teilweise?

Zeige, was danach geschah – beabsichtigte und unbeabsichtigte Konsequenzen

Sei ehrlich: Erfolg, Misserfolg oder beides

Beispiel: „Die Reaktion war nicht wie erwartet – im Gegenteil, es wurde zuerst sogar unangenehmer…“

5. AUFLÖSUNG / ERKENNTNIS
Was hast du aus der Erfahrung gelernt?

Wie hat sich deine Perspektive oder dein Handeln verändert?

Beziehe deine Einsicht auf ein übergeordnetes Lebens- oder Business-Prinzip

Mach es für deine Leser greifbar und umsetzbar

Formatierungsrichtlinien:
Nutze kurze, leicht lesbare Sätze mit 1–2 Leerzeilen Abstand

Verwende fettgedruckten Text oder andere visuelle Highlights – aber dezent

Setze Stichpunkte (→) bei wichtigen Erkenntnissen, wenn sinnvoll

Tonfall:
Gesprächig und authentisch – wie du mit einer Freundin oder einem Kollegen über etwas sprichst, das dich wirklich beschäftigt hat. Zeige Verletzlichkeit mit professioneller Haltung.

Beispielhafter Ablauf:
„Vor ein paar Monaten war ich [EXPOSITION: normale Situation]…
Doch dann [KONFLIKT: etwas Unerwartetes geschah], und ich fühlte mich [Emotion]…
Also beschloss ich, [HANDLUNG: was du daraus gemacht hast]…
Das Ergebnis? [FOLGEN: was wirklich geschah]…
Rückblickend wurde mir klar: [ERKENNTNIS: was du gelernt hast]…“

Thema für deine Anekdote:`
};

const promptBusiness10 = {
  en: `# Task: Write LinkedIn Business Posts Using Top List Format Analysis You will create LinkedIn business posts by first analyzing successful list-based professional content, then developing your own numbered or bulleted approach for the given topic.  ## **LIST-BASED STYLE REFERENCE ANALYSIS:** Based on successful LinkedIn list content, here are common characteristics you may consider:  ### **Potential List Frameworks:** - "X Mistakes That..." (highlighting common errors to avoid) - "X Signs You Should..." (indicators or red flags) - "X Ways to..." (actionable strategies or methods) - "X Things I Learned..." (insights from experience) - "X Reasons Why..." (supporting arguments for a position) - "X Truths About..." (industry insights or reality checks)  ### **Possible Opening Approaches:** - Bold statement followed by the list promise - Personal experience that led to discovering these insights - Industry observation that reveals the need for this knowledge - Contrarian take that challenges conventional wisdom  ### **List Structure Considerations:** - **Number Range:** 3-10 items typically work best (odd numbers often feel more authentic) - **Item Format:** Can be single sentences, short paragraphs, or one-liners with brief explanations - **Flow:** Items can build on each other or stand independently - **Balance:** Mix obvious and surprising insights for credibility and interest  ### **Style Elements to Consider:** - **Hook:** Strong opening that justifies why this list matters - **Clarity:** Each list item should be immediately understandable - **Value:** Every point should offer genuine insight or actionability - **Formatting:** Use numbers, arrows, or bullet points for visual appeal - **Connection:** Relate items to common professional experiences  ### **Engagement Techniques:** - Include one controversial or unexpected item - Reference specific situations professionals encounter - Add brief context or examples where helpful - Use "you" language to make it personally relevant  ## **YOUR TASK:** 1. **Analyze the given topic** and determine what list format would be most valuable 2. **Choose your number** - decide how many items best serve your content (don't force 10 if 5 is better) 3. **Develop your angle** - what's your unique take or experience with this topic? 4. **Structure for impact** - organize your list logically (importance, chronology, or narrative flow) 5. **Make each item count** - ensure every point adds distinct value  ## **FLEXIBILITY GUIDELINES:** - **Adapt your list type** to the specific topic - some need warnings, others need strategies - **Find your voice** - be authoritative but relatable in your insights - **Balance brevity and depth** - each item should be concise but meaningful - **End strategically** - conclude in a way that reinforces the list's value  ## **QUALITY MARKERS:** Your post should: - Lead with a compelling reason to read the list - Contain genuinely useful insights in each item - Feel authentic to professional experience - Be scannable yet substantive - Conclude with impact or next steps  --- **Topic for your LinkedIn list post:** `,
  de: `Aufgabe: Verfasse LinkedIn-Business-Posts im Listenformat mithilfe stilistischer Analyse
Du wirst LinkedIn-Business-Posts im Listenformat erstellen, indem du zuerst erfolgreiche Beispiele analysierst und dann eine eigene, nummerierte oder stichpunktartige Struktur für das vorgegebene Thema entwickelst.

STILANALYSE – LISTENBASIERTE INHALTE:
Basierend auf erfolgreichen LinkedIn-Listenposts findest du hier typische Muster, die du berücksichtigen kannst:

Mögliche Listenformate:
„X Fehler, die ...“ (häufige Fehler, die man vermeiden sollte)

„X Anzeichen, dass du ... solltest“ (Warnsignale oder Hinweise)

„X Wege, wie du ... kannst“ (konkrete Strategien oder Tipps)

„X Dinge, die ich gelernt habe über ...“ (Erkenntnisse aus der Erfahrung)

„X Gründe, warum ...“ (Argumente für eine Position)

„X Wahrheiten über ...“ (Einsichten in Branchenrealitäten)

Mögliche Einstiege:
Eine klare, starke Aussage, gefolgt vom Versprechen der Liste

Eine persönliche Erfahrung, die zu diesen Erkenntnissen geführt hat

Eine Branchenbeobachtung, die die Relevanz des Themas zeigt

Eine konträre Haltung, die mit gängiger Meinung bricht

Hinweise zur Strukturierung der Liste:
Anzahl: 3–10 Punkte funktionieren am besten (ungerade Zahlen wirken oft natürlicher)

Format der Punkte: Einzelsätze, kurze Absätze oder prägnante Aussagen mit kurzer Erläuterung

Aufbau: Punkte können aufeinander aufbauen oder unabhängig voneinander funktionieren

Balance: Eine Mischung aus erwartbaren und überraschenden Erkenntnissen sorgt für Glaubwürdigkeit und Interesse

Stilelemente zur Beachtung:
Hook: Ein starker Einstieg, der erklärt, warum diese Liste wichtig ist

Klarheit: Jeder Punkt sollte sofort verständlich sein

Mehrwert: Jeder Eintrag sollte echten Nutzen oder Handlungsimpuls bieten

Formatierung: Nutze Zahlen, Pfeile (→) oder Bulletpoints für die Lesbarkeit

Bezug: Knüpfe an typische berufliche Erfahrungen an

Engagement-Techniken:
Baue einen kontroversen oder unerwarteten Punkt ein

Beziehe dich auf konkrete berufliche Situationen

Gib bei Bedarf kurze Kontexte oder Beispiele

Nutze „du“-Sprache, um Nähe zum Leser aufzubauen

DEINE AUFGABE:
Analysiere das vorgegebene Thema – welches Listenformat bringt den meisten Mehrwert?

Wähle die passende Anzahl – wie viele Punkte sind wirklich sinnvoll? (Zwing dich nicht zu 10, wenn 5 ausreichen)

Finde deinen Blickwinkel – was ist deine persönliche Perspektive oder Erfahrung zu diesem Thema?

Strukturiere mit Wirkung – baue die Liste logisch auf (nach Wichtigkeit, Zeitfolge oder Wirkung)

Mach jeden Punkt relevant – jeder Punkt soll eigenständig und wertvoll sein

FLEXIBILITÄTSLEITLINIEN:
Passe den Listentyp an das Thema an – manche brauchen Warnhinweise, andere praktische Tipps

Finde deinen Ton – sei kompetent, aber nahbar

Halte die Balance zwischen Kürze und Tiefe – knapp, aber mit Substanz

Beende strategisch – sorge dafür, dass der Schluss die Liste abrundet und im Gedächtnis bleibt

QUALITÄTSMERKMALE:
Dein Post sollte:

Mit einem starken Grund beginnen, warum man weiterlesen sollte

In jedem Punkt einen echten Mehrwert liefern

Auf beruflichen Erfahrungen basieren

Gut scannbar, aber dennoch inhaltsstark sein

Mit einem nachhaltigen Abschluss oder einem Impuls zum Nachdenken enden

Thema für deinen LinkedIn-Listenpost:`
};

const promptWehelpyou = {
  en: `# Task: Write LinkedIn Business Posts That Position Your Expertise as Solutions You will create LinkedIn business posts that develop a given topic while naturally showcasing how your comprehensive services can drive business growth through AI-forward innovation.  ## **BUSINESS POSITIONING ANALYSIS:** Based on successful service-oriented LinkedIn content, here are approaches you may consider:  ### **Potential Topic Development Angles:** - Industry challenge to solution positioning - Future trend observations with practical applications - Personal experience stories that demonstrate expertise - Market shifts that create opportunities for growth - Technology evolution narratives with business implications  ### **Service Integration Approaches:** - **Consulting Perspective:** Strategic insights and business transformation guidance - **Technical Excellence:** Complex hardware product development and implementation - **AI Innovation:** Cutting-edge software solutions and intelligent automation - **Future-Ready Mindset:** Positioning businesses for AI-driven market evolution  ### **Value Proposition Elements:** - **Multi-disciplinary Expertise:** Demonstrate breadth across consulting, hardware, and software - **AI-First Philosophy:** Show understanding that AI integration is essential, not optional - **Business Growth Focus:** Connect technical capabilities to measurable business outcomes - **Progress Orientation:** Emphasize forward-thinking solutions and competitive advantage  ### **Positioning Techniques:** - Start with industry insight, transition to solution capability - Use "I've seen..." or "I help..." statements to establish authority - Reference specific business challenges your audience faces - Connect technical solutions to business growth metrics - Show how AI integration multiplies traditional approaches  ## **YOUR TASK:** 1. **Develop the given topic** into a compelling business narrative 2. **Weave in your expertise** naturally - don't just list services 3. **Position AI as essential** for future business success 4. **Address multiple business angles** that your services solve 5. **Create urgency** around adopting AI-forward approaches 6. **End with clear value proposition** for working with you  ## **FLEXIBILITY GUIDELINES:** - **Match tone to topic** - analytical for data topics, visionary for trends, practical for challenges - **Balance insight and promotion** - lead with value, close with capability - **Show, don't just tell** - reference outcomes or transformations you've enabled - **Address the whole business** - operations, strategy, and technology alignment  ## **QUALITY MARKERS:** Your post should: - Establish thought leadership on the topic - Naturally connect to business growth opportunities - Position AI integration as competitive necessity - Demonstrate multi-faceted expertise without being pushy - Create desire to learn more about your approach - Feel consultative rather than purely promotional  ## **SERVICE AREAS TO WEAVE IN:** - Strategic consulting for AI transformation - Complex hardware product development - Intelligent software solutions and automation - Business process optimization through AI - Future-proofing strategies for market evolution  --- **Topic to develop into your business-focused post:** `,
  de: `Aufgabe: Verfasse LinkedIn-Business-Posts, die deine Expertise als Lösung positionieren
Du wirst LinkedIn-Posts erstellen, die ein vorgegebenes Thema entwickeln und dabei auf natürliche Weise zeigen, wie deine umfassenden Services durch KI-getriebene Innovation das Unternehmenswachstum vorantreiben können.

ANALYSE ZUR BUSINESS-POSITIONIERUNG:
Basierend auf erfolgreichen, serviceorientierten LinkedIn-Inhalten findest du hier verschiedene Herangehensweisen:

Mögliche Themenentwicklungen:
Branchenspezifische Herausforderungen → Lösungsperspektiven

Zukunftstrends mit konkretem Anwendungsbezug

Persönliche Erfahrungsberichte, die deine Expertise verdeutlichen

Marktveränderungen als Wachstumschancen

Technologische Entwicklungen mit klaren Business-Auswirkungen

Wege zur Service-Integration:
Beratungsperspektive: Strategische Einblicke und Begleitung von Business-Transformationen

Technische Exzellenz: Entwicklung und Implementierung komplexer Hardwarelösungen

KI-Innovation: Moderne Softwarelösungen und intelligente Automatisierung

Zukunftsfähigkeit: Unternehmen auf eine KI-getriebene Marktlandschaft vorbereiten

Kernbotschaften deines Angebots:
Interdisziplinäre Expertise: Breite Kompetenz in Beratung, Hardware und Software

KI-First-Denken: KI ist nicht optional, sondern geschäftskritisch

Wachstumsfokus: Technische Kompetenz wird in konkrete Business-Ergebnisse übersetzt

Zukunftsorientierung: Lösungen mit Wettbewerbsvorteil für das Morgen

Positionierungstechniken:
Beginne mit einer Branchenbeobachtung, leite dann zur Lösung über

Nutze Formulierungen wie „Ich sehe oft...“ oder „Ich helfe Unternehmen dabei...“

Sprich typische Business-Herausforderungen deines Zielpublikums an

Verknüpfe technische Lösungen mit Wachstumsmetriken

Zeige, wie KI traditionelle Ansätze skaliert oder ersetzt

DEINE AUFGABE:
Entwickle das gegebene Thema zu einer überzeugenden Business-Erzählung

Verflechte deine Expertise organisch – vermeide reine Service-Auflistungen

Positioniere KI als unverzichtbar für unternehmerischen Erfolg

Beziehe mehrere Business-Perspektiven ein, die deine Services abdecken

Schaffe Dringlichkeit, sich mit KI-gestützten Ansätzen auseinanderzusetzen

Beende mit einem klaren Wertversprechen, warum eine Zusammenarbeit sinnvoll ist

FLEXIBILITÄTSLEITLINIEN:
Passe den Ton ans Thema an – analytisch bei Daten, visionär bei Trends, praxisnah bei Herausforderungen

Balance zwischen Insight und Angebot – führe mit Mehrwert, schließe mit Kompetenz

Zeigen statt nur Behaupten – benenne konkrete Ergebnisse oder Transformationen

Ganzheitlich denken – Strategie, Technologie und Prozesse im Zusammenspiel ansprechen

QUALITÄTSMERKMALE:
Dein Post sollte:

Dich als Thought Leader zu diesem Thema positionieren

Klar aufzeigen, wie Business-Wachstum möglich ist

KI als notwendige strategische Investition darstellen

Deine vielseitige Expertise sichtbar machen, ohne aufdringlich zu wirken

Den Wunsch wecken, mehr über deinen Ansatz zu erfahren

Beratend und lösungsorientiert wirken – nicht wie reine Werbung

SERVICEBEREICHE, DIE DU EINFLIESSEN LASSEN KANNST:
Strategische Beratung für KI-getriebene Transformation

Entwicklung komplexer Hardware-Produkte

Intelligente Softwarelösungen & Automatisierung

Optimierung von Geschäftsprozessen mit KI

Zukunftssichere Strategien für Marktveränderungen

Thema zur Entwicklung deines Business-Posts:`
};



