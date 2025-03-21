// client/src/components/TranslationAdmin.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ToggleSwitch 컴포넌트 (동그란 토글 스위치)
const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <label className='relative inline-block w-12 h-6 cursor-pointer'>
      <input
        type='checkbox'
        checked={isOn}
        onChange={handleToggle}
        className='sr-only'
      />
      <div
        className={`w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${
          isOn ? 'bg-green-500' : 'bg-gray-300'
        }`}
      ></div>
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out ${
          isOn ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></span>
    </label>
  );
};

// REST API 호출을 중앙화한 헬퍼 객체
const api = {
  getDocument: (articleId) => axios.get(`/document?articleId=${articleId}`),
  translateDocument: (articleId) =>
    axios.get(`/translate/preview?articleId=${articleId}`),
  saveTranslation: (articleId, translatedText, translatedTitle) =>
    axios.post(`/translate/confirm`, {
      articleId,
      translatedText,
      translatedTitle,
    }),
};

const TranslationAdmin = () => {
  const [document, setDocument] = useState(null);
  const [docIdInput, setDocIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showRaw, setShowRaw] = useState(false); // 토글 상태
  const logContainerRef = useRef(null); // 로그 컨테이너 참조

  // 로그가 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 단일 문서 조회
  const fetchDocumentById = async () => {
    if (!docIdInput) {
      setLogs((prev) => [...prev, '문서 ID를 입력하세요.']);
      return;
    }
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${docIdInput} 불러오는 중...`]);
    try {
      const res = await api.getDocument(docIdInput);
      console.log('Document data:', res.data);
      setDocument({ ...res.data, translationSaved: false });
      setLogs((prev) => [...prev, `문서 ${docIdInput} 불러오기 완료`]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `문서 ${docIdInput} 불러오기 실패: ${
          error.response?.data?.error || error.message
        }`,
      ]);
    }
    setLoading(false);
  };

  // 번역하기
  const translateDocument = async () => {
    if (!document) return;
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${document.id} 번역 요청 중...`]);
    try {
      const res = await api.translateDocument(document.id);
      setDocument((prev) =>
        prev
          ? {
              ...prev,
              enTitle: res.data.translatedTitle,
              enBody: res.data.translatedBody,
            }
          : null
      );
      setLogs((prev) => [...prev, `문서 ${document.id} 번역 완료`]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `문서 ${document.id} 번역 실패: ${
          error.response?.data?.error || error.message
        }`,
      ]);
    }
    setLoading(false);
  };

  // 번역 저장하기
  const saveTranslation = async () => {
    if (!document || !document.enBody || !document.enTitle) return;
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${document.id} 번역 저장 요청 중...`]);
    try {
      await api.saveTranslation(document.id, document.enBody, document.enTitle);
      setDocument((prev) =>
        prev ? { ...prev, translationSaved: true } : null
      );
      setLogs((prev) => [...prev, `문서 ${document.id} 번역 저장 완료`]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `문서 ${document.id} 번역 저장 실패: ${
          error.response?.data?.error || error.message
        }`,
      ]);
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-[#4BD8D0] shadow'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-800'>
            Zendesk 언어 번역기
            <span style={{ fontSize: '1.2rem' }}> 1.4v</span>
          </h1>
          <img className='h-40 ml-auto' src='/chil.png' alt='이미지 없음' />
          <div className='flex flex-col items-end'>
            <h4 className='font-bold mt-1 self-start'>상태 로그</h4>
            <div
              ref={logContainerRef}
              className='w-80 h-24 bg-gray-100 border border-gray-300 rounded p-2 overflow-y-auto text-xs'
            >
              <pre className='whitespace-pre-wrap text-left'>
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        </div>
      </header>
      {/* Main */}
      <main className='max-w-7xl mx-auto py-6 px-4'>
        <div className='flex flex-col sm:flex-row items-center mb-6 space-y-2 sm:space-y-0 sm:space-x-4'>
          <input
            type='text'
            value={docIdInput}
            onChange={(e) => setDocIdInput(e.target.value)}
            placeholder='문서 ID 입력'
            className='p-2 border border-gray-300 rounded w-full sm:w-64'
          />
          <button
            onClick={fetchDocumentById}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
          >
            {loading ? '불러오는 중...' : '문서 가져오기'}
          </button>
          {document && (
            <>
              <button
                onClick={translateDocument}
                disabled={loading}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
              >
                번역하기
              </button>
              <button
                onClick={saveTranslation}
                disabled={
                  loading ||
                  document.translationSaved ||
                  !document.enBody ||
                  !document.enTitle
                }
                className={`px-4 py-2 bg-purple-600 text-white rounded transition-colors ${
                  loading ||
                  document.translationSaved ||
                  !document.enBody ||
                  !document.enTitle
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-700'
                }`}
              >
                {document.translationSaved ? '게시완료' : '번역 저장하기'}
              </button>
            </>
          )}
        </div>
        {document && (
          <div className='flex justify-end mb-4 items-center space-x-2'>
            <span className='text-sm font-medium'>HTML5 Code 보기</span>
            <ToggleSwitch
              isOn={showRaw}
              handleToggle={() => setShowRaw((prev) => !prev)}
            />
          </div>
        )}
        {document ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 원본 문서 카드 (좌측) */}
            <div className='bg-white p-6 rounded-lg shadow-inner border border-gray-300 h-[calc(100vh-300px)] overflow-y-auto animate-fadeIn'>
              <h3 className='text-2xl font-semibold mb-4'>{document.title}</h3>
              {showRaw ? (
                <pre className='whitespace-pre-wrap prose max-w-none'>
                  {document.body}
                </pre>
              ) : (
                <div
                  className='prose max-w-none'
                  dangerouslySetInnerHTML={{ __html: document.body }}
                ></div>
              )}
              {document.articleUrl && (
                <a
                  href={document.articleUrl}
                  className='mt-4 inline-block text-blue-500 underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  공식 기사 페이지 보기
                </a>
              )}
            </div>
            {/* 영어 번역 카드 (우측) */}
            <div className='bg-white p-6 rounded-lg shadow-inner border border-gray-300 h-[calc(100vh-300px)] overflow-y-auto animate-fadeIn'>
              <h3 className='text-2xl font-semibold mb-4'>영어 번역</h3>
              <h4 className='text-xl font-medium mb-2'>
                {document.enTitle || '(영어 제목 없음)'}
              </h4>
              {showRaw ? (
                <pre className='whitespace-pre-wrap prose max-w-none flex-grow'>
                  {document.enBody || '(영어 번역이 없습니다.)'}
                </pre>
              ) : (
                <div
                  className='prose max-w-none flex-grow'
                  dangerouslySetInnerHTML={{ __html: document.enBody }}
                ></div>
              )}
            </div>
          </div>
        ) : (
          <p className='text-center text-gray-600'>
            가져올 문서의 ID를 입력해 주세요.
          </p>
        )}
      </main>
      {/* Footer */}
      <footer className='bg-white shadow mt-8'>
        <div className='max-w-7xl mx-auto px-4 py-4 text-center text-gray-500'>
          © sang-woo is never die
        </div>
      </footer>
    </div>
  );
};

export default TranslationAdmin;
