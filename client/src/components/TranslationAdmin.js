// client/src/components/TranslationAdmin.js
import React, { useState } from 'react';
import axios from 'axios';

const TranslationAdmin = () => {
  const [document, setDocument] = useState(null);
  const [docIdInput, setDocIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // 단일 문서 조회: /document 엔드포인트 호출
  const fetchDocumentById = async () => {
    if (!docIdInput) {
      setLogs((prev) => [...prev, '문서 ID를 입력하세요.']);
      return;
    }
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${docIdInput} 불러오는 중...`]);
    try {
      const res = await axios.get(
        `http://localhost:3000/document?articleId=${docIdInput}`
      );
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

  // 번역하기: /translate/preview 호출하여 번역된 제목과 본문 받아오기
  const translateDocument = async () => {
    if (!document) return;
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${document.id} 번역 요청 중...`]);
    try {
      const res = await axios.get(
        `http://localhost:3000/translate/preview?articleId=${document.id}`
      );
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

  // 번역 저장하기: /translate/confirm 호출 (여기서는 저장 후 버튼 레이블 변경)
  const saveTranslation = async () => {
    if (!document || !document.enBody || !document.enTitle) return;
    setLoading(true);
    setLogs((prev) => [...prev, `문서 ${document.id} 번역 저장 요청 중...`]);
    try {
      await axios.post('http://localhost:3000/translate/confirm', {
        articleId: document.id,
        translatedText: document.enBody,
        translatedTitle: document.enTitle,
      });
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
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-800'>
            Translation Dashboard
          </h1>
          {/* 로그 상태창: 우측 상단, 고정 크기, 스크롤 */}
          <div className='w-80 h-24 bg-gray-100 border border-gray-300 rounded p-2 overflow-y-auto text-xs'>
            <h4 className='font-bold mb-1'>상태</h4>
            <pre className='whitespace-pre-wrap'>{logs.join('\n')}</pre>
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
                disabled={loading || !document.enBody || !document.enTitle}
                className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
              >
                {document.translationSaved ? '게시완료' : '번역 저장하기'}
              </button>
            </>
          )}
        </div>
        {document ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 원본 문서 카드 (좌측) */}
            <div className='bg-white p-6 rounded-lg shadow h-96 overflow-y-auto'>
              <h3 className='text-2xl font-semibold mb-4'>{document.title}</h3>
              <div
                className='prose max-w-none'
                dangerouslySetInnerHTML={{ __html: document.body }}
              ></div>
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
            <div className='bg-white p-6 rounded-lg shadow h-96 overflow-y-auto flex flex-col'>
              <h3 className='text-2xl font-semibold mb-4'>영어 번역</h3>
              <h4 className='text-xl font-medium mb-2'>
                {document.enTitle || '(영어 제목 없음)'}
              </h4>
              <div className='prose max-w-none flex-grow'>
                {document.enBody || '(영어 번역이 없습니다.)'}
              </div>
            </div>
          </div>
        ) : (
          <p className='text-center text-gray-600'>문서를 가져오세요.</p>
        )}
      </main>
      {/* Footer */}
      <footer className='bg-white shadow mt-8'>
        <div className='max-w-7xl mx-auto px-4 py-4 text-center text-gray-500'>
          © 2025 Your Company. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default TranslationAdmin;
