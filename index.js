window.currentRecordId = null;
window.addEventListener('load', getTitles);


// window.addEventListener('load', async () => {
//  const url = document.getElementById('urlInput').value;
//   try {
//     const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/get-latest-prompt', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: { 'action': 'display latest prompt' }
//     });

//     // Only act if the response is marked as final
//     if (response.status === 295) {
//       const json = await response.json();
//       document.getElementById('promptinput').value = json["Content"] || 'No content';
//       console.log("Content:", json["Content"]);
//     }

//     // All other status codes are ignored silently

//   } catch (error) {
//     console.error('Error posting URL:', error);
//     document.getElementById('textResult').value = 'Error retrieving content.';
//   }
// });


async function getTitles() {
  const dropdown = document.getElementById('dropdowntitles');
  dropdown.innerHTML = ''; // Clear existing options

  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/get-titles', {
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
    


      // // Optional: auto select first
      // if (titles.length > 0) {
      //   const first = titles[0];
      //   document.getElementById('textResult').value = first.Input;
      //   console.log("First record ID:", first.id);
      //   console.log("Created:", first.createdTime);
      // }
    }

  } catch (error) {
    console.error('Error fetching titles:', error);
    document.getElementById('textResult').value = 'Error loading titles.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dropdowntitles').addEventListener('change', async function () {
    const selectedOption = this.options[this.selectedIndex];
    const selectedId = selectedOption.value;
    window.currentRecordId = selectedId;

    if (!selectedId) return;

    try {
      const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/get-latest-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId })
      });

      if (response.status === 298) {
        const result = await response.json();

        // ✅ Always show the full original input
        const fullInput = selectedOption.title || result.Input;

        document.getElementById('textResult').value = result.Content || 'No content';
        document.getElementById('textInput').value = fullInput || 'No content';
        document.getElementById('promptInput').value = result.MainPrompt || 'No content';

        console.log("Loaded:", result);
        document.getElementById('dropdowntitles').value = '__placeholder__';
      }

    } catch (error) {
      console.error('Error fetching single title:', error);
      document.getElementById('textResult').value = 'Error retrieving post.';
    }
  });
});

async function postURL() {
  const url = document.getElementById('urlInput').value;

  try {
    const response = await fetch('https://lenot344.app.n8n.cloud/webhook/url-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    // Only act if the response is marked as final
    if (response.status === 299) {
      const json = await response.json();
      document.getElementById('textResult').value = json["Content"] || 'No content';
      console.log("ID:", json.id);
      console.log("Title:", json["Name/ID"]);
      console.log("Created:", json["Created time"]);
      console.log("Content:", json["Content"]);

    }

    // All other status codes are ignored silently

  } catch (error) {
    console.error('Error posting URL:', error);
    document.getElementById('textResult').value = 'Error retrieving content.';
  }
}

async function postText() {
  const text = document.getElementById('textInput').value;
  const prompt = document.getElementById('promptInput').value;
  const selectedDropdown = document.getElementById('dropdown').value;

  const formData = {
    text: text,
    dropdown: selectedDropdown,
    emojis: document.getElementById('emojis').checked.toString(),
    cta: document.getElementById('cta').checked.toString(),
    facts: document.getElementById('facts').checked.toString(),
    // longPost: document.getElementById('longPost').checked.toString(),
    hotTakes: document.getElementById('hotTakes').checked.toString(),
    // clickbait: document.getElementById('clickbait').checked.toString(),
    images: document.getElementById('images').checked.toString(),
    customPrompt: document.getElementById('custom-prompt').checked.toString(),
    prompt: prompt
  };
  document.getElementById('dropdowntitles').value = '__placeholder__';  
  
  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/generate-from-text', {
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
      document.getElementById('textResult').value = metadata?.Content || 'No content';

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

      // clickbait titles
      const clickbaitBox = document.getElementById('textCards');
      clickbaitBox.innerHTML = '';

      for (let i = 1; i <= 10; i++) {
        const query = json[`query${i}`];
        if (query) {
          const input = document.createElement('input');
          input.type = 'text';
          input.value = query;
          input.readOnly = true;
          input.style.width = '100%';
          input.style.margin = '5px 0';
          input.style.fontSize = '14px';
          clickbaitBox.appendChild(input);
        }
      }

    }
  } catch (error) {
    console.error('Error posting URL:', error);
    document.getElementById('textResult').value = 'Error retrieving content.';
  }
}

// // Handle 294 response (multiple text results)
// if (response.status === 294) {
//   let json = await response.json();
//   const dataArray = Array.isArray(json) ? json : (json.body ?? [json]);

//   console.log('Received multiple texts:', dataArray);

//   const container = document.getElementById('textCards');
//   container.innerHTML = ''; // clear old results

//   dataArray.forEach(item => {
//     if (!item.Content) return;

//     const card = document.createElement('div');
//     card.className = 'text-card';
//     card.textContent = item.Content;
//     container.appendChild(card);
//   });
// }

async function generateArticles(WS_AI) {
  try {
    const res = await fetch('https://lenot344.app.n8n.cloud/webhook/generate-articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ WS_AI }),
    });
    
    // Only act if the response is marked as final
    if (response.status === 299) {
      const json = await response.json();
      document.getElementById('textResult').value = json["Content"] || 'No content';
      console.log("ID:", json.id);
      console.log("Title:", json["Name/ID"]);
      console.log("Created:", json["Created time"]);
      console.log("Content:", json["Content"]);
    }

    // All other status codes are ignored silently

  } catch (error) {
    console.error('Error posting URL:', error);
    document.getElementById('textResult').value = 'Error retrieving content.';
  }
}

function deleteRecord(table) {
  const recordID = prompt("Enter Airtable Record ID to delete:");
  if (!recordID) return;
  fetch(TEXT_DELETE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordID })
  })
  .then(res => res.json())
  .then(data => alert('Deleted!'))
  .catch(err => console.error(err));
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
  let promptType;

  if (inputName === 'input') {
    promptElement = document.getElementById('textInput');
    promptType = 'input';
  } else if (inputName === 'result') {
    promptElement = document.getElementById('textResult');
    promptType = 'result';
  } else if (inputName === 'prompt') {
    promptElement = document.getElementById('promptInput');
    promptType = 'prompt';
  } else {
    console.error('Invalid inputName passed to continueAI');
    return;
  }

  const promptText = promptElement.value;

  const formData = {
    content: promptText,
    type: promptType
  };

  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/continue-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.status === 292) {
      const json = await response.json();
      const continuation = json.message.content || '[No content received]';

      // Append continued text to the box
      promptElement.value += continuation;
    }

  } catch (error) {
    console.error('Error continuing text with AI:', error);
  }
}

async function generateAI(inputName) {
  let targetElement;
  let promptType;

  if (inputName === 'input') {
    targetElement = document.getElementById('textInput');
    promptType = 'input';
  } else if (inputName === 'result') {
    targetElement = document.getElementById('textResult');
    promptType = 'result';
  } else if (inputName === 'prompt') {
    targetElement = document.getElementById('promptInput');
    promptType = 'prompt';
  } else {
    console.error('Invalid inputName passed to generateNewAI');
    return;
  }

  const formData = {
    type: promptType
  };

  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/generate-new-text', {
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
    alert('No record selected.');
    return;
  }

  const formData = {
    id: window.currentRecordId
  };

  try {
    const response = await fetch('https://lenyes346.app.n8n.cloud/webhook/delete-record', {
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
      document.getElementById('textInput').value = '';
      document.getElementById('promptInput').value = '';

      currentRecordId = null;

      console.log('Record deleted and removed from UI.');
    }

  } catch (error) {
    console.error('Error deleting record:', error);
  }
}


[
  { "url": "https://lenyes346.app.n8n.cloud/workflow/20jTer0mQUOZCvsn", "alt": "..." },
  { "url": "http://localhost:81", "alt": "..." }
]

function displayImageGallery(images) {
  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = ''; // Clear existing content

  if (!Array.isArray(images)) {
    console.error('Invalid image array:', images);
    gallery.textContent = 'Error: invalid image data received.';
    return;
  }

  images.forEach(({ url, alt }) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt || 'Image';
    img.title = alt || 'Image';
    img.style = `
      max-width: 200px;
      margin: 5px;
      border: 1px solid #ccc;
      cursor: pointer;
    `;
    gallery.appendChild(img);
  });
}

// Basic Text Editing
function formatText(cmd) {
  document.execCommand(cmd, false, null);
}

function highlightText() {
  document.execCommand('backColor', false, 'yellow');
}

function insertList() {
  document.getElementById('textInput').value += '\n• ';
}

function insertEmoji() {
  document.getElementById('textInput').value += '😊';
}
