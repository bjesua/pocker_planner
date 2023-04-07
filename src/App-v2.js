import React from 'react';
import './style.css';
import { db } from './firebase';
import { uid } from 'uid';
import {
  set,
  ref,
  getDatabase,
  onValue,
  remove,
  update,
} from 'firebase/database';
import { useState, useEffect } from 'react';
import { computeHeadingLevel } from '@testing-library/react';

import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';

export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  //rewrite
  const [cards, setCards] = useState([]);
  const [data, setData] = useState([]);
  const [cardSelected, setCardSelected] = useState('');
  const [avg, setAvg] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCardClick = (value) => {
    // console.log(JSON.stringify(data));

    const uuid = uid();
    if (data.hasOwnProperty('cartas_usuario')) {
      const filteredObj = Object.values(data.cartas_usuario).filter(
        (item) => item.user.toLowerCase() === name.toLocaleLowerCase()
      );

      if (filteredObj[0]) {
        set(ref(db, `/cartas_usuario/${filteredObj[0].id}`), {
          carta: value,
          user: name,
          id: filteredObj[0].id,
        });
      } else {
        set(ref(db, `/cartas_usuario/${uuid}`), {
          carta: value,
          user: name,
          id: uuid,
        });
      }
    } else {
      set(ref(db, `/cartas_usuario/${uuid}`), {
        carta: value,
        user: name,
        id: uuid,
      });
    }
  };

  useEffect(() => {
    const uuid = uid();
    if (window.sessionStorage.getItem('user') === null) {
      setShow(true);
      //setName(uuid);
    } else {
      setName(window.sessionStorage.getItem('user'));
    }

    if (data.hasOwnProperty('cartas_usuario')) {
      const cartasArray = Object.values(data.cartas_usuario);
      const avg =
        cartasArray.reduce((sum, carta) => sum + carta.carta, 0) /
        cartasArray.length;
      set(ref(db, `avg/`), {
        avg: avg.toFixed(1),
      });
    }
  });
  // write
  useEffect(() => {
    //read
    onValue(ref(db), (snapshot) => {
      const data = snapshot.val();
      setData(data);
      setShowResults(data.status.status);
      if (data.hasOwnProperty('cartas_usuario')) {
        Object.values(data.cartas_usuario).map((card) => {
          setCards(card);
          if (card.user.toLocaleLowerCase() == name.toLocaleLowerCase()) {
            setCardSelected(card.carta);
          }
        });
      } else {
        setCardSelected([]);
        setCards([]);
      }
    });
  }, [name]);

  const cleanAll = () => {
    remove(ref(db, `/cartas_usuario/`));
    set(ref(db, `status/`), {
      status: false,
    });

    set(ref(db, `avg/`), {
      avg: 0,
    });
  };

  const handleShowResults = () => {
    //calculate avg
    if (data.status.status) {
      set(ref(db, `status/`), {
        status: false,
      });
    } else {
      set(ref(db, `status/`), {
        status: true,
      });
    }
  };

  const handleName = (e) => {
    setName(e.target.value);
    window.sessionStorage.setItem('user', e.target.value);
  };

  const handleSubmitName = () => {
    setShow(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    location.reload();
  };

  return (
    <>
      <body>
        <Navbar>
          <Container>
            <Navbar.Brand href="/">
              Poker Planner <Badge bg="dark">Beta</Badge>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <Button variant="dark" onClick={handleLogout}>
                  {name} | Logout
                </Button>
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div>
          <div className="container">
            <h1>
              <br />
            </h1>
            <br />
            <div>
              <Button variant="warning" onClick={() => cleanAll()}>
                Iniciar Nuevamente
              </Button>
              <br />
              <br />
              {data.hasOwnProperty('cartas_usuario') &&
              Object.values(data.cartas_usuario).length > 0 ? (
                <Button variant="success" onClick={handleShowResults}>
                  Mostrar Resultados
                </Button>
              ) : (
                <Button variant="secondary">Mostrar Resultados</Button>
              )}

              {showResults && data.hasOwnProperty('cartas_usuario') ? (
                <>
                  <div className="grid">
                    {Object.values(data.cartas_usuario).map((carta) => (
                      <div>
                        {carta.carta ? (
                          <>
                            <div key={carta.id} className="cards">
                              {carta.carta}
                            </div>
                            <p>{carta.user}</p>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    ))}
                  </div>

                  <h4>
                    <b>Promedio: {data.avg.avg ?? ''}</b>
                  </h4>
                </>
              ) : (
                <></>
              )}
            </div>

            {!showResults && data.hasOwnProperty('cartas_usuario') ? (
              <>
                <div className="grid">
                  {Object.values(data.cartas_usuario).map((carta) => (
                    <>
                      <div className="cardsName">{carta.user}</div>
                    </>
                  ))}
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="grid">
              {[0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100].map((value) => (
                <div
                  key={value}
                  className="cards"
                  onClick={() => {
                    if (!showResults) {
                      handleCardClick(value);
                    }
                  }}
                  style={{
                    backgroundColor: (cardSelected === value ? true : false)
                      ? '#FF6D28'
                      : '#00F5FF',
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}

        <Navbar fixed="bottom">
          <Container>
            <Navbar.Brand href="/">
              {/* Poker Planner <Badge bg="dark">Beta</Badge> */}
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>By: Jesua Sagastume</Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* alert name */}
        <>
          <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>Ingresa tu nombre</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="Name">
                  <Form.Control
                    type="text"
                    placeholder="John"
                    onChange={handleName}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleSubmitName}>
                Continuar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </body>
    </>
  );
}
