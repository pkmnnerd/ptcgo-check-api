document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cookieForm").addEventListener("submit", onSubmitCookie);
  document.getElementById("codeForm").addEventListener("submit", onSubmitCodes);
});

const onSubmitCookie = (event) => {
  event.preventDefault();
  document.getElementById("cookieInput").setAttribute('disabled', 'true')
  document.getElementById("cookieSubmitButton").setAttribute('disabled', 'true')
  document.getElementById("codeForm").style.display = 'block';
}

const onSubmitCodes = (event) => {
  event.preventDefault();
  document.getElementById("codeInput").setAttribute('disabled', 'true');
  const submitButton = document.getElementById("codeSubmitButton");
  submitButton.setAttribute('disabled', 'true')
  submitButton.textContent = "Processing..."

  const codes = document.getElementById("codeInput").value.split('\n');
  const filteredCodes = codes.map((code) => code.trim())
    .filter((code) => code.length > 0)
    .map((code) => code.replace(/[^A-Za-z0-9-]/g, ''));
  console.log(filteredCodes);
  const timestamp = new Date();
  const sessionId = document.getElementById("cookieInput").value;
  createSubmissionTable(timestamp, filteredCodes, sessionId);
  console.log(sessionId);
  checkCodes(timestamp.getTime(), codes, sessionId);
}

const createSubmissionTable = (timestamp, codes, sessionId) => {
  const wrapper = document.createElement('div');
  wrapper.id = `submission-${timestamp.getTime()}`;

  const thead = document.createElement('thead');
  thead.innerHTML = "<tr><th>Code</th><th>Status</th><th>API Link</th></tr>"

  const tbody = document.createElement('tbody');

  codes.forEach((code, i) => {
    const tr = document.createElement('tr');
    const id = `code-${timestamp.getTime()}-${i}-status`
    const link = `/ptcgo-check-api/code?code=${code}&session_id=${sessionId}`
    console.log(link);
    tr.innerHTML = `<td>${code}</td><td id=${id}><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td><td><a href="${link}" target="_blank">${link}</a></td>`;
    tbody.append(tr);
  })

  const table = document.createElement('table');
  table.classList.add('table');
  table.append(thead);
  table.append(tbody);

  const header = document.createElement('h3');
  header.textContent = `Submission at ${timestamp.toLocaleString()}`;

  wrapper.append(header);
  wrapper.append(table);

  const container = document.getElementById("submissions")
  container.prepend(wrapper);
}

const htmlDecode = (input) => {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

const checkCode = async (timestamp, code, index, sessionId) => {
  await fetch(`/ptcgo-check-api/code?code=${code}&session_id=${sessionId}`)
    .then(res => {
      return res.json().then((body) => {
        if (res.ok) {
          return body;
        } else {
          const message = body.detail || res.statusText;
          throw Error(message);
        }
      })
    })
    .then(body => {
      let status;
      if (body.valid) {
        status = htmlDecode(body.coupon_title);
      } else {
        status = body.error_message;
      }
      const id = `code-${timestamp}-${index}-status`
      document.getElementById(id).innerText = status;
    })
    .catch(error => {
      const id = `code-${timestamp}-${index}-status`
      document.getElementById(id).innerText = `Error: ${error.message}`;
    });
}

const checkCodes = async (timestamp, codes, sessionId) => {
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
    await checkCode(timestamp, code, i, sessionId);
  }
  document.getElementById("codeInput").removeAttribute('disabled');
  const submitButton = document.getElementById("codeSubmitButton");
  submitButton.removeAttribute('disabled')
  submitButton.textContent = 'Submit';
}