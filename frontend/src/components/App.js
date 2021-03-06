import React, {useState, useEffect} from 'react';
import { Switch, Route, Redirect, useHistory} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Header from "./Header";
import Login from "./Login";
import Register from "./Register";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmPopup from './ConfirmPopup';
import api from "../utils/api";
import * as auth from "../utils/auth";
import useEventListener from '@use-it/event-listener';
import {CurrentUserContext} from '../contexts/CurrentUserContext';

import infoTooltipDoneImage from '../images/done-query.svg';
import infoTooltipErrorImage from '../images/error-query.svg';
import InfoTooltip from "./InfoTooltip";

function App() {

  const history = useHistory();

  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setImagePopup] = useState(false);
  const [isConfirmPopupOpen, setConfirmPopup] = useState(false);
  const [isInfoPopupOpen, setInfoPopupOpen] = useState(false)

  const [selectedCard, setSelectedCard] = useState({});
  const [cards, setCards] = useState([]);

  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [headerUserLogin, setHeaderUserLogin] = useState('');

  const [isInfoTooltip, setInfoTooltip] = useState({message : '', image : ''});

  const [currentUser, setCurrentUser] = React.useState(CurrentUserContext);

  function checkToken(){

    auth.checkUserToken()
      .then((data) => {
        if (data) {
          setCurrentUser(data);
          setLoggedIn(true);
          setHeaderUserLogin(data.email);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleLogin({email, password}){

    setLoading(true);

    auth.login({
      email, password
    })
      .then((res) => {
        if(res){    
          checkToken();    
          getCards();  
          setHeaderUserLogin(email);

          setLoggedIn(true);

          setInfoTooltip({
            message : '???? ?????????????? ????????????????????????????!',
            image : infoTooltipDoneImage
          });

          setInfoPopupOpen(true);
        }
      })
      .catch(() => {
        setLoggedIn(false);
        setInfoTooltipError()
        setInfoPopupOpen(true);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  function handleRegister({email, password}){

    setLoading(true);

    auth.register({
        email, password
      })
      .then((res) => {

        history.push('/singin');

        setInfoTooltip({
          message : '???? ?????????????? ????????????????????????????????????!',
          image : infoTooltipDoneImage
        });
        setInfoPopupOpen(true);
      })
      .catch((err) => {
        setInfoTooltipError()
        setInfoPopupOpen(true);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  function handleSignOut() {
    auth.signOut()
      .then((res) => {
        setLoggedIn(false);
        setHeaderUserLogin('');
      })
      .catch((err) => console.log(`Error: ${err}`))
  }


  function setInfoTooltipError() {
    setInfoTooltip({
      message : '??????-???? ?????????? ???? ??????! ???????????????????? ?????? ??????.',
      image : infoTooltipErrorImage
    })
  }

  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true)
  }

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true)
  }

  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true)
  }

  function handleConfirmClick() {
    setConfirmPopup(true)
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setImagePopup(true);
  }

  function handleCardConfirmDelete(card){
    setSelectedCard(card);
    handleConfirmClick();
  }

  function handlePressEsc({ key }) {
    if(key === 'Escape') closeAllPopups()
  }

  function handleLayoutClick(popup) {
    popup.addEventListener('mousedown', evt => {
      evt.target === evt.currentTarget && closeAllPopups();
    });
  }


  function closeAllPopups() {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setImagePopup(false);
    setConfirmPopup(false);
    setInfoPopupOpen(false);

    setTimeout(() => {
      setLoading(false);
      setSelectedCard({});
    }, 700)
  }

  function handleAddPlaceSubmit({name, link}) {
    setLoading(true);
    api.addCard({name, link})
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups()
      }).catch(error => console.log(error));
  }

  function handleCardDelete() {
    setLoading(true);

    api.deleteCard({cardId : selectedCard._id})
      .then(() => {
        const newCards = cards.filter((c) => c._id !== selectedCard._id);

        setCards(newCards);
        closeAllPopups();
        setSelectedCard({});

      }).catch(error => console.log(error));
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i === currentUser._id);

    api.changeLikeCardStatus({cardId : card._id, isLiked: !isLiked})
      .then((newCard) => {
        const newCards = cards.map((c) => c._id === card._id ? newCard : c);
        setCards(newCards);
      }).catch(error => console.log(error));
  }

  function handleUpdateAvatar({avatar}) {
    setLoading(true);
    api.setUserAvatar({avatar})
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      }).catch(error => console.log(error));
  }

  function handleUpdateUser({name, about}){
    setLoading(true);

    api.setUserInfo({name, about})
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      }).catch(error => console.log(error));
  }

  function getCards(){
    api.getCards()
      .then((data) => {
        if (Array.isArray(data)) {
          setCards(data.reverse());
        }
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
    checkToken();
    getCards();
  }, [])

  useEventListener('keydown', handlePressEsc);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="body">
        <div className="root">
          <Header
            isLoggedIn={isLoggedIn}
            userLogin={headerUserLogin}
            onSignOut={handleSignOut}
          />
          <main className="main">
            <Switch>
              <ProtectedRoute
                exact
                path='/'
                isLoggedIn={isLoggedIn}
                component={Main}
                onEditProfile={handleEditProfileClick}
                onEditAvatar={handleEditAvatarClick}
                onConfirmClick={handleCardConfirmDelete}
                onAddPlace={handleAddPlaceClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                cards={cards}
              />
              <Route path="/signin">
                {
                  isLoggedIn
                  ? <Redirect to="/" />
                  : <Login isLoading={isLoading}
                           onSubmit={handleLogin}
                    />
                }
              </Route>

              <Route path="/signup">
                {
                  isLoggedIn
                  ? <Redirect to="/" />
                  : <Register
                      isLoading={isLoading}
                      onSubmit={handleRegister}
                    />
                }
              </Route>
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </main>
          <Footer/>
        </div>
        
        <AddPlacePopup 
          isOpen={isAddPlacePopupOpen} 
          onClose={closeAllPopups} 
          onLayout={handleLayoutClick}
          onAddPlace={handleAddPlaceSubmit} 
          isLoading={isLoading}/>

        <EditAvatarPopup 
          isOpen={isEditAvatarPopupOpen} 
          onClose={closeAllPopups} 
          onLayout={handleLayoutClick}
          onUpdateAvatar={handleUpdateAvatar} 
          isLoading={isLoading}/> 
        
        <EditProfilePopup 
          isOpen={isEditProfilePopupOpen} 
          onClose={closeAllPopups} 
          onLayout={handleLayoutClick}
          onUpdateUser={handleUpdateUser} 
          isLoading={isLoading}/> 

        <ImagePopup 
          card={selectedCard} 
          isOpen={isImagePopupOpen} 
          onClose={closeAllPopups}
          onLayout={handleLayoutClick}/>

        <ConfirmPopup 
          isOpen={isConfirmPopupOpen} 
          onClose={closeAllPopups}
          onLayout={handleLayoutClick} 
          onConfirm={handleCardDelete}
          handleLayoutClickisLoading={isLoading}/>

        <InfoTooltip
          name="info-tooltip"
          isOpen={isInfoPopupOpen}
          onClose={closeAllPopups}
          onLayout={handleLayoutClick}
          message={isInfoTooltip.message}
          image={isInfoTooltip.image}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
