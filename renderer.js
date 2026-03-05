let currentFilePath = null;
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Marked 설정
marked.setOptions({
  breaks: true,
  gfm: true
});

// 실시간 미리보기 업데이트
function updatePreview() {
  const markdown = editor.value;
  const html = marked.parse(markdown);
  const clean = DOMPurify.sanitize(html);
  preview.innerHTML = clean;
}

// 입력 이벤트
editor.addEventListener('input', updatePreview);

// 상태 업데이트
function updateStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function updateFilePath(path) {
  document.getElementById('file-path').textContent = path || '';
}

// 파일 열기
async function openFile() {
  const result = await window.electronAPI.openFile();
  if (result) {
    editor.value = result.content;
    updatePreview();
    currentFilePath = result.path;
    updateFilePath(result.path);
    updateStatus('파일 열림');
  }
}

// 파일 저장
async function saveFile() {
  const content = editor.value;
  const result = await window.electronAPI.saveFile({
    path: currentFilePath,
    content: content
  });
  
  if (result) {
    currentFilePath = result;
    updateFilePath(result);
    updateStatus('저장 완료');
  }
}

// 버튼 이벤트
document.getElementById('btn-open').addEventListener('click', openFile);
document.getElementById('btn-save').addEventListener('click', saveFile);

// 메뉴 이벤트
window.electronAPI.onMenuOpen(() => openFile());
window.electronAPI.onMenuSave(() => saveFile());

// 키보드 단축키
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveFile();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    openFile();
  }
});

// 초기화
updatePreview();
updateStatus('준비됨');
