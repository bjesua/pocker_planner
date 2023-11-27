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

import { Button, Row, Col } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { decode as base64_decode, encode as base64_encode } from 'base-64';

export default function App() {
  // session
  const [showSession, setShowSession] = useState(false);
  const handleCloseSession = () => setShowSession(false);
  const [nameSession, setNameSession] = useState('');
  const [nameSessionManual, setNameSessionManual] = useState('');

  // user
  const [showResults, setShowResults] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  //rewrite
  const [cards, setCards] = useState([]);
  const [data, setData] = useState([]);
  const [cardSelected, setCardSelected] = useState('');
  const [avg, setAvg] = useState('');
  const [loggedUsers, setLoggedUsers] = useState([]);

  const [ip, setIP] = useState('');

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
      // setShow(true);
      // setName(uuid);
      setShowSession(true);
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
    const uuid = uid();
    setNameSession(uuid);
    //read
    onValue(ref(db), (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      // console.log(data.usuarios);
      const new_users = [];

      if (data.usuarios) {
        Object.values(data.usuarios).forEach((val) => {
          if (!new_users.includes(val.user)) new_users.push(val.user);
        });
        data.new_usuarios = new_users;
      }
      // console.log('Data', data.new_usuarios);
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

      if (data.hasOwnProperty('usuarios')) {
        Object.values(data.usuarios).map((u) => {
          setLoggedUsers(u);
        });
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
    console.log(e.target.value);
  };
  // const handleSubmitName = () => {
  //   if (data.new_usuarios.includes(name)) {
  //     alert('Usuario Ya registrado');
  //   } else {
  //     const uuid = uid();
  //     window.sessionStorage.setItem('user', name);
  //     window.sessionStorage.setItem('userCode', btoa(uuid));
  //     set(ref(db, `/usuarios/${uuid}`), {
  //       user: name,
  //       id: uuid,
  //     });
  //     setShow(false);
  //   }
  // };

  const handleNameSession = (e) => {
    setNameSession(e.target.value);
  };
  const handleNameSessionManual = (e) => {
    nameSessionManual(e.target.value);
  };
  const handleSubmitNameSession = () => {
    if (data.new_usuarios) {
      const users = data.new_usuarios;
      if (users.includes(name)) {
        alert('Usuario Ya registrado');
      } else {
        const uuid = uid();
        window.sessionStorage.setItem('user', name);
        window.sessionStorage.setItem('userCode', btoa(uuid));
        window.sessionStorage.setItem('session_id', nameSession);

        if (nameSessionManual != '') {
          nameSession = nameSessionManual;
        }

        // create user
        set(ref(db, `/usuarios/${uuid}`), {
          user: name,
          id: uuid,
          session_id: nameSession,
        });
        // create session
        set(ref(db, `/session/${nameSession}`), {
          session_id: nameSession,
          status: true,
        });

        // add user to session
        console.log('Creating users sesion names ');
        update(ref(db, `/session/${nameSession}/users/${name}`), {
          user: name,
          id: uuid,
          session_id: nameSession,
          status: true,
        });
        // status
        set(ref(db, `status/`), {
          session_id: nameSession,
          status: true,
        });
        setShowSession(false);
      }
    } else {
      const uuid = uid();
      window.sessionStorage.setItem('user', name);
      window.sessionStorage.setItem('userCode', btoa(uuid));
      window.sessionStorage.setItem('session_id', nameSession);
      set(ref(db, `/usuarios/${uuid}`), {
        user: name,
        id: uuid,
        session_id: nameSession,
      });
      // create session
      set(ref(db, `/session/${nameSession}`), {
        session_id: nameSession,
        status: true,
      });
      setShowSession(false);
    }
  };

  const handleLogout = () => {
    const decoded = atob(window.sessionStorage.getItem('userCode'));
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userCode');
    sessionStorage.removeItem('session_id');
    remove(ref(db, `/usuarios/${decoded}`));
    remove(ref(db, `/session/${nameSession}`));
    location.reload();
  };

  const handleLogoutAllSessions = () => {
    const decoded = atob(window.sessionStorage.getItem('userCode'));
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userCode');
    sessionStorage.removeItem('session_id');
    remove(ref(db, `/usuarios/`));
    remove(ref(db, `/cartas_usuario/`));
    remove(ref(db, `/session/`));
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
                  {nameSession} | Session ID
                </Button>
                <Button variant="dark" onClick={handleLogout}>
                  {name} | Logout
                </Button>
                <Button variant="light" onClick={handleLogoutAllSessions}>
                  Logout All Sessions
                </Button>{' '}
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div>
          <div className="container">
            <div>
              {/* {data.hasOwnProperty('usuarios') && loggedUsers ? (
                <>
                  <Badge pill bg="danger">
                    &nbsp;
                  </Badge>
                  &nbsp;
                  {data.new_usuarios.map((u) => (
                    <>
                      <Badge pill bg="dark" key={u}>
                        {u}
                      </Badge>
                      &nbsp;
                    </>
                  ))}
                </>
              ) : (
                <></>
              )} */}
            </div>

            <br />
            <div>
              <Button variant="warning" onClick={() => cleanAll()}>
                Iniciar Nuevamente
              </Button>
              <br />

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
                      <div className="cardsName" key={carta.user}>
                        {carta.user}
                      </div>
                    </>
                  ))}
                </div>
              </>
            ) : (
              <></>
            )}
            <br />
            {data.hasOwnProperty('cartas_usuario') &&
            Object.values(data.cartas_usuario).length > 0 ? (
              <Button variant="success" onClick={handleShowResults}>
                Mostrar Resultados
              </Button>
            ) : (
              <Button variant="secondary">Mostrar Resultados</Button>
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
        {/* <>
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
        </> */}

        {/* alert session */}
        <>
          <Modal
            show={showSession}
            onHide={handleCloseSession}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col
                  style={{
                    border: `1px solid #ced4da`,
                    borderRadius: `5px`,
                    height: `110px`,
                  }}
                >
                  <h4>Create Session: </h4>
                  {nameSession}
                </Col>
                <Col
                  style={{
                    border: `1px solid #ced4da`,
                    borderRadius: `5px`,
                    height: `110px`,
                  }}
                >
                  <h4>Join Session: </h4>
                  <Form>
                    <Form.Group className="mb-3" controlId="Name">
                      <Form.Control
                        type="text"
                        placeholder="Session ID"
                        onChange={handleNameSessionManual}
                      />
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h4>Name to display</h4>
                  <Form.Group className="mb-3" controlId="Name">
                    <Form.Control
                      type="text"
                      placeholder="John"
                      onChange={handleName}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleSubmitNameSession}>
                Continuar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </body>
    </>
  );
}
