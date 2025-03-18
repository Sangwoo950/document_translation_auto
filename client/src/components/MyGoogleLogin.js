// client/src/components/MyGoogleLogin.js
import React from 'react';
import { GoogleLogin } from 'react-google-login';

const clientId = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // 실제 클라이언트 ID로 변경

const MyGoogleLogin = () => {
  const onSuccess = (response) => {
    // response.profileObj.email을 통해 이메일 정보를 얻습니다.
    const email = response.profileObj.email;
    if (email.endsWith('@wadiz.kr')) {
      // 사내 이메일인 경우 로그인 성공 처리
      console.log('사내 사용자 로그인 성공:', email);
      // 추가적으로, 백엔드로 토큰 전송하는 등 처리 가능
    } else {
      // 사내 이메일이 아니라면 에러 처리
      alert('사내 이메일(@wadiz.kr)만 로그인 가능합니다.');
    }
  };

  const onFailure = (response) => {
    console.error('구글 로그인 실패:', response);
  };

  return (
    <div>
      <GoogleLogin
        clientId={clientId}
        buttonText='구글 로그인'
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        hostedDomain='wadiz.kr' // hd 파라미터가 자동으로 적용됩니다.
      />
    </div>
  );
};

export default MyGoogleLogin;
