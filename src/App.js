import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './Post';
import { auth, db } from './firebase';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Input } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import InstagramEmbed from 'react-instagram-embed';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5], 
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const [posts, setPosts] = useState([]);
  //modal 사용시 필요함
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn]=useState(false);

  //modal에서 입력받을 변수들
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null); // 추적할 상태 조각 변수들
  //로그인, 로그아웃 모든 변경사항이 발생할때마다 어떻게 되는지 볼 수 있도록 리스터 패턴사용


  useEffect(() => { //body안에서 정해준 특정 값이 변할때만 실행이 자동으로 되는 
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in..
        console.log(authUser);
        setUser(authUser); //새로고침해도 여전히 로그인되어 있음을 확인할 수 있음

        if (authUser.displayName) {
          // dont update username
        }
        else {
          // if we just created someone
          return authUser.updateProfile({
            displayName: username,
          });
        }
      }
      else {
        // user has logged out..
        setUser(null);
      }
    })

    // 함수처리
    return () => {
      unsubscribe();
    }
  }, [user, username]);


  //useEffect (onSnapshot: firebase 문서가 변경되면 매번 자동 수정됨)
  //.orderBy('timestamp', 'desc') 타임기록
  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      //every time a new post is added, this code.

      //for문처럼 firebase의 document(doc)를 확인한다
      //doc 내부에는 username, caption, imageUrl 들어있다
      //게시물을 계속 업데이트 하게 된다 -> 하드코딩의 불편함 제거함
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id, //firebase에서 자동생성한 id 얻어옴
        post: doc.data() //해당 id의 데이터 요소들을 얻어옴
      })));
    })
  }, []);

  //회원가입 버튼 활성화
  const signUp = (event) => {
    event.preventDefault(); //새로고침했을때 내가 입력한 값이라던가 상태가 초기화가 되지않게

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch((error) => alert(error.message))

      setOpen(false); //회원가입 modal 닫기
  }

  //로그인 버튼 활성화
  const signIn=(event)=>{
    event.preventDefault();

    auth
    .signInWithEmailAndPassword(email, password)
    .catch((error)=>alert(error.message))

    setOpenSignIn(false); //로그인 modal 닫기
  }



  return ( //JSX
    <div className="app">
      <Modal
        open={open}
        onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="" />

              <Input placeholder="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <Button type="submit" onClick={signUp}>Sign Up</Button>
            </center>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="" />

              <Input placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <Button type="submit" onClick={signIn}>Sign In</Button>
            </center>
          </form>
        </div>
      </Modal>



      {/*Header*/}
      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />
        {/*로그인 회원가입 / user 상태에 맞게 modal 버튼 띄우기*/}
        {user ? (
          <Button onClick={() => auth.signOut()}>LogOut</Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
      )}
      </div>


      {/*Posts*/}
      <div className="app__posts">
        <div className="app__postsLeft">
          { //posts와 map
            // 고유키(key)인 firebase의 id를 추가함
            // 새 게시물이 추가되어도 실제로 새로고침 하지않고 추가됨 (전체 렌더링이 필요없어짐)
            // 기존의 게시물이 모두 새로고침되지 않고 추가되는 새로운 것만 새로고침되어 추가됨
            // key값으로 id를 추가함으로써 어느 부분이 변경되었는지 확인할 수 있음
            posts.map(({ id, post }) => (
              <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageUrl={post.imageUrl} />
            ))
          }
        </div>
        <div className="app__postsRight">
          <InstagramEmbed
            url='https://www.instagram.com/p/CRYV6DOM2py9C9idRhp70ywnXrbgp79P7WjT0o0/'
            maxWidth={320}
            hideCaption={false}
            containerTagName='div'
            protocol=''
            injectScript
            onLoading={() => {}}
            onSuccess={() => {}}
            onAfterRender={() => {}}
            onFailure={() => {}}
        />
        </div>
      </div>

      {/*이미지 업로드 / user가 정의되지 않았을 경우 보호*/}
      {user?.displayName?(
        <ImageUpload username={user.displayName}/>
      ):(
        <h3>sorry you need to login to upload</h3>
      )}

    </div>
  );
}

export default App;
