let currentFilePath = null;
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Marked 설정
marked.setOptions({
  breaks: true,
  gfm: true
});

// 실시간 미리보기
function updatePreview() {
  const markdown = editor.value;
  const html = marked.parse(markdown);
  const clean = DOMPurify.sanitize(html);
  preview.innerHTML = clean;
}

editor.addEventListener('input', updatePreview);

// 텍스트 삽입 헬퍼
function insertText(before, after = '') {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);
  const replacement = before + selected + after;
  
  editor.setRangeText(replacement, start, end, 'end');
  editor.focus();
  updatePreview();
}

function insertLine(prefix) {
  const start = editor.selectionStart;
  const beforeCursor = editor.value.substring(0, start);
  const lineStart = beforeCursor.lastIndexOf('\n') + 1;
  
  editor.setRangeText(prefix, lineStart, lineStart, 'end');
  editor.focus();
  updatePreview();
}

// 툴바 버튼
document.getElementById('btn-h1').addEventListener('click', () => insertLine('# '));
document.getElementById('btn-h2').addEventListener('click', () => insertLine('## '));
document.getElementById('btn-h3').addEventListener('click', () => insertLine('### '));
document.getElementById('btn-bold').addEventListener('click', () => insertText('**', '**'));
document.getElementById('btn-italic').addEventListener('click', () => insertText('*', '*'));
document.getElementById('btn-strike').addEventListener('click', () => insertText('~~', '~~'));
document.getElementById('btn-ul').addEventListener('click', () => insertLine('- '));
document.getElementById('btn-ol').addEventListener('click', () => insertLine('1. '));
document.getElementById('btn-quote').addEventListener('click', () => insertLine('> '));
document.getElementById('btn-link').addEventListener('click', () => insertText('[', '](url)'));
document.getElementById('btn-code').addEventListener('click', () => insertText('`', '`'));

// 자동 리스트 기능
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const start = editor.selectionStart;
    const text = editor.value;
    const beforeCursor = text.substring(0, start);
    const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = beforeCursor.substring(currentLineStart);
    
    // - 리스트 자동 계속
    const ulMatch = currentLine.match(/^(\s*)-\s+(.*)$/);
    if (ulMatch) {
      if (ulMatch[2] === '') {
        // 빈 리스트: 제거하고 일반 줄바꿈
        e.preventDefault();
        const newText = text.substring(0, currentLineStart) + text.substring(start);
        editor.value = newText;
        editor.selectionStart = editor.selectionEnd = currentLineStart;
      } else {
        // 다음 리스트 항목
        e.preventDefault();
        const indent = ulMatch[1];
        const insert = '\n' + indent + '- ';
        editor.setRangeText(insert, start, start, 'end');
      }
      updatePreview();
      return;
    }
    
    // 1. 번호 리스트 자동 계속
    const olMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (olMatch[3] === '') {
        // 빈 리스트: 제거
        e.preventDefault();
        const newText = text.substring(0, currentLineStart) + text.substring(start);
        editor.value = newText;
        editor.selectionStart = editor.selectionEnd = currentLineStart;
      } else {
        // 다음 번호
        e.preventDefault();
        const indent = olMatch[1];
        const nextNum = parseInt(olMatch[2]) + 1;
        const insert = '\n' + indent + nextNum + '. ';
        editor.setRangeText(insert, start, start, 'end');
      }
      updatePreview();
      return;
    }
  }
});

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
  
  // Ctrl+B: 굵게
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    insertText('**', '**');
  }
  
  // Ctrl+I: 이탤릭
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    insertText('*', '*');
  }
});

// 초기화
updatePreview();
updateStatus('준비됨');
