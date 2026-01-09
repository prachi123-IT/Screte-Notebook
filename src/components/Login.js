import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = (props) => {
    let navigate = useNavigate();
    const [credentails, setCredentails] = useState({ email: "", password: "" })
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: credentails.email, password: credentails.password })
        });
        const json = await response.json()
        console.log(json);
        if (json.Success) {
            localStorage.setItem('token', json.authtoken)
            navigate("/")
            props.showAlert("Login successfully","success")
        }
        else {
            props.showAlert("Invalid details","danger")
        }
    }
    const onChange = (e) => {
        setCredentails({ ...credentails, [e.target.name]: e.target.value })
    }
    return (
        <div className='mt-3'>
            <h2>Login to continue to iNotebook</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" value={credentails.email} id="email" name="email" aria-describedby="emailHelp" onChange={onChange} />

                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" value={credentails.password} id="password" name="password" onChange={onChange} />
                </div>

                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
}

export default Login
