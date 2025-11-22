import { useState } from "react";
import axios from "axios";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    const localBackend = "http://localhost:1337/api";
    const liveBackend = "https://kalaty-backend-production-66a7.up.railway.app/api"
    const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTc2MDk1NDY4NCwiZXhwIjoxNzYzNTQ2Njg0fQ.z8IaRT27qvwBuK_RxLrgHgJuW74XIPDVQH2XMLIBMfY"
    const [ count, setCount ] = useState( 0 );
    const [ apiData1, setApiData1 ] = useState( null );
    const [ apiData2, setApiData2 ] = useState( null );
    const [ loading, setLoading ] = useState( false );
    const adminHeader = {
        headers: { Authorization: `Bearer ${adminToken}` }
    }
    const BACKEND_API = axios.create( {
        baseURL: local0.Backend
    } )
    // Example 1: GET request
    const fetchUsers = async () => {
        try {
            setLoading( true );
            // const res = await axios.get( `${liveBackend}/collections`, {
            //   headers: {
            //     Authorization: `Bearer ${adminToken}`,
            //   },
            // } );
            // axios.get( "https://kalaty-backend-production-66a7.up.railway.app/api/collections", { headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTc2MDk1NDY4NCwiZXhwIjoxNzYzNTQ2Njg0fQ.z8IaRT27qvwBuK_RxLrgHgJuW74XIPDVQH2XMLIBMfY" } } )
            BACKEND_API
                .get( "/admin/analytics", adminHeader )
                .then( res => { console.log( res ) } )
                .catch( err => { console.log( err ) } )
            // console.log( res.data )
            // setApiData1( res.data.slice( 0, 3 ) .); // get first 3 users
        } catch ( err ) {
            console.error( "Error fetching users:", err );
        } finally {
            setLoading( false );
        }
    };

    // Example 2: POST request
    const createPost = async () => {
        try {
            setLoading( true );
            BACKEND_API
                .post( "/login", { email: "zaidkamboo100@gmail.com", password: 'Nothing@12' } )
                .then( res => { console.log( res ) } )
                .catch( err => console.log( err ) )
            // const res = await axios.post( `${localBackend}/auth/login`, {
            //     // username: "admin12",
            //     email: "zaidkamboo100@gmail.com",
            //     password: "Nothing@12",
            //     // verifyPassword: "Nothing@12",

            // } );

            console.log( "Res", res )
            setApiData2( res.data );
        } catch ( err ) {
            console.error( "Error creating post:", err );
        } finally {
            setLoading( false );
        }
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={ viteLogo } className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={ reactLogo } className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Vite + React + Axios</h1>

            <div className="card">
                <button onClick={ () => setCount( ( count ) => count + 1 ) }>
                    count is { count }
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>

                {/* New API buttons */ }
                <div style={ { marginTop: "1rem" } }>
                    <button onClick={ fetchUsers } disabled={ loading }>
                        Fetch Users (GET)
                    </button>
                    <button onClick={ createPost } disabled={ loading } style={ { marginLeft: "0.5rem" } }>
                        Create Post (POST)
                    </button>
                </div>
            </div>

            {/* Display API Results */ }
            <div className="results" style={ { marginTop: "2rem" } }>
                { loading && <p>Loading...</p> }

                { apiData1 && (
                    <div>
                        <h3>Fetched Users:</h3>
                        <ul>
                            { apiData1.map( ( user ) => (
                                <li key={ user.id }>{ user.name }</li>
                            ) ) }
                        </ul>
                    </div>
                ) }

                { apiData2 && (
                    <div>
                        <h3>Created Post:</h3>
                        <pre>{ JSON.stringify( apiData2, null, 2 ) }</pre>
                    </div>
                ) }
            </div>

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
