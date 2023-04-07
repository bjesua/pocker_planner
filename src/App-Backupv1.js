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

export default function App() {
  const [todo, setTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [temUuid, setTempUuid] = useState('');
  const [total, setTotal] = useState(0);

  const [clickedCards, setClickedCards] = useState([]);
  const [deleteTodo, setDeleteTodo] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCardClick = (value) => {
    if (clickedCards.includes(value)) {
      // Remove the clicked card from clickedCards array
      setClickedCards(clickedCards.filter((card) => card !== value));
    } else {
      // Add clicked card value to the clickedCards array
      if (clickedCards.length == 0) {
        setTodo(value);
        setClickedCards([...clickedCards, value]);
      }
    }
  };

  //avg cartas
  const average =
    clickedCards.reduce((acc, val) => acc + val, 0) / clickedCards.length || 0;

  const handleTodoChange = (e) => {
    setTodo(e.target.value);
  };

  const avg =
    (
      todos.reduce((acc, cur) => (cur.todo ? acc + cur.todo : acc), 0) /
      todos.filter((item) => item.todo).length
    ).toFixed(2) != 'NaN'
      ? (
          todos.reduce((acc, cur) => (cur.todo ? acc + cur.todo : acc), 0) /
          todos.filter((item) => item.todo).length
        ).toFixed(2)
      : 0;

  // write
  const wrieToDatabase = () => {
    if (todo != '') {
      const uuid = uid();
      set(ref(db, `/${uuid}`), {
        todo,
        uuid,
      });

      setTodo('');
    } else {
      alert('Necesitas un voto!');
    }
  };

  useEffect(() => {
    //read
    onValue(ref(db), (snapshot) => {
      setTodos([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((todo) => {
          setTodos((oldArray) => [...oldArray, todo]);
        });
      }
    });

    onValue(ref(db), (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      if (data.status.status === 'true') {
        setShowResults(true);
      } else {
        setShowResults(false);
        // setClickedCards([]);
      }
    });
  }, []);

  useEffect(() => {
    if (name === '') {
      // setShow(true);
      setName('(Sandbox)');
    }

    if (clickedCards[0]) {
      const uuid = uid();
      set(ref(db, `/${uuid}`), {
        todo: todo,
        uuid: uuid,
        name: name,
      });
      setTodo('');
    }
  }, [clickedCards]);

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTempUuid(todo.uuid);
    setTodo(todo.todo);
  };
  const handleSubmitChange = () => {
    update(ref(db, `/${temUuid}`), {
      todo,
      uuid: temUuid,
    });

    setTodo('');
    setIsEdit(false);
  };
  // delete
  const handleDelete = (todo) => {
    setDeleteTodo(true);
    remove(ref(db, `/${todo.uuid}`));
  };

  const cleanAll = () => {
    todos.map((to) => {
      remove(ref(db, `/${to.uuid}`));
    });
    setDeleteTodo(true);
    setShowResults(false);
  };

  const handleShowResults = () => {
    if (showResults) {
      set(ref(db, `status/`), {
        status: 'false',
      });
      setShowResults(false);
    } else {
      set(ref(db, `status/`), {
        status: 'true',
      });
      setShowResults(true);

      const activateStatusToShow = todos.find((t) => {
        return t.status === 'true';
      });
      if (activateStatusToShow === 'true') {
        showResults(true);
      }

      setClickedCards([]);
      // console.log('fina', show);
    }
  };

  const handleName = (e) => {
    setName(e.target.value);
  };

  const handleSubmitName = () => {
    setShow(false);
  };

  return (
    <>
      <div>
        {/* <h1>Pocker Planning!</h1> */}
        <div>
          {/* <input type="text" value={todo} onChange={handleTodoChange} /> */}
          {isEdit ? (
            <>
              {/* <button onClick={handleSubmitChange}>Submit Change</button> */}
              <button
                onClick={() => {
                  setIsEdit(false);
                  setTodo('');
                }}
              >
                X
              </button>
            </>
          ) : (
            <>{/* <button onClick={wrieToDatabase}>Submit</button> */}</>
          )}

          {todos.map((todo) => (
            <>
              {/* <h1>{todo.todo}</h1> */}
              {/* <button onClick={() => handleUpdate(todo)}>update</button> */}
              {/* <button onClick={() => handleDelete(todo)}>Delete</button> */}
            </>
          ))}
        </div>
        <br />

        <div className="container">
          <h1> Poker Planner</h1>
          <p>Bienvenido {name}</p>
          <div>
            <Button variant="warning" onClick={() => cleanAll()}>
              Iniciar Nuevamente
            </Button>
            <br />
            <br />
            <Button variant="success" onClick={handleShowResults}>
              Mostrar Resultados
            </Button>

            {showResults ? (
              <>
                <div className="grid">
                  {todos.map((todo) => (
                    <div>
                      {todo.todo ? (
                        <>
                          <div key={todo.todo} className="cards">
                            {todo.todo}
                          </div>
                          <p>{todo.name}</p>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  ))}
                </div>

                <h3>Promedio: {avg}</h3>
              </>
            ) : (
              <></>
            )}
          </div>
          <div className="grid">
            {[0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100].map((value) => (
              <div
                key={value}
                className="cards"
                onClick={() => handleCardClick(value)}
                style={{
                  backgroundColor: clickedCards.includes(value)
                    ? '#FF6D28'
                    : '#00F5FF',
                }}
              >
                {value}
              </div>
            ))}
          </div>
          {/* <p>Average: {average}</p> */}
        </div>
      </div>

      <>
        {/* <Button variant="primary" onClick={handleShow}>
          Launch static backdrop modal
        </Button> */}

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
    </>
  );
}
