let currentFilePath = null;
let editor;

// Toast UI Editor 초기화
document.addEventListener('DOMContentLoaded', () => {
  const Editor = toastui.Editor;
  
  editor = new Editor({
    el: document.querySelector('#editor'),
    height: 'calc(100vh - 100px)',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    initialValue: '# 여기에 마크다운을 작성하세요...\n\n## 예시\n\n- 리스트 1\n- 리스트 2\n- 리스트 3\n\n**굵게** *이탤릭*',
    usageStatistics: false,
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock']
    ]
  });
  
  updateStatus('준비됨');
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
    editor.setMarkdown(result.content);
    currentFilePath = result.path;
    updateFilePath(result.path);
    updateStatus('파일 열림');
  }
}

// 파일 저장
async function saveFile() {
  const content = editor.getMarkdown();
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
