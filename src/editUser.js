import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Form, FormGroup, Input } from 'reactstrap';


const EDIT_USER = gql`
            mutation updateUserById($id:Int!, $name:String, $email:String, $gender:String) {
                updateUser(id:$id,name:$name,email:$email,gender:$gender ){
                    id,
                    name,
                    gender,
                    email
            }
        }`
class EditUser extends Component {

    state = {
        id: -1,
        name: "",
        email: "",
        gender: "",
        submitted: false
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            id: nextProps.user.id,
            name: nextProps.user.name,
            email: nextProps.user.email,
            gender: nextProps.user.gender
        })
    }
    validate = () => {
        this.setState({ submitted: true })
    }
    render() {
        const { name, email, gender } = this.state;
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Please update details</ModalHeader>
                <ModalBody>
                    <Form>
                        <Input type="text" name="name" placeholder="Name" defaultValue={name} onChange={e => this.setState({ name: e.target.value })} />
                        {(this.state.submitted && this.state.name === "") ? <p style={{ color: "red" }}>Please enter your name</p> : null}
                        <br />
                        <Input type="email" name="email" placeholder="Email" defaultValue={email} onChange={e => this.setState({ email: e.target.value })} />
                        {(this.state.submitted && this.state.email === "") ? <p style={{ color: "red" }}>Please enter your email</p> : null}
                        <br />
                        Select your gender:
                        <FormGroup check>
                            <Input type="radio" defaultChecked={(gender === "Male")} name="gender" value="Male" onChange={() => this.setState({ gender: "Male" })} /> {" "}
                            Male
                        </FormGroup>
                        <FormGroup check>
                            <Input type="radio" defaultChecked={(gender === "Female")} name="gender" value="Female" onChange={() => this.setState({ gender: "Female" })} /> {" "}
                            Female
                        </FormGroup>
                        {(this.state.submitted && this.state.gender === "") ? <p style={{ color: "red" }}>Please select your gender</p> : null}

                        <ModalFooter>
                            <Mutation mutation={EDIT_USER} variables={{ ...this.state }} onCompleted={this.props.toggle}
                                update={(cache, { data: { updateUser } }) => {
                                    const { users } = cache.readQuery({ query: this.props.query, variables: { ...this.props.pagination } });
                                    const { id, name, gender, email } = updateUser;
                                    let i = users.findIndex(user => parseInt(user.id, 10) === parseInt(id, 10))
                                    users[i] = { ...users[i], name, gender, email }
                                    cache.writeQuery({
                                        query: this.props.query,
                                        data: { users: users },
                                        variables: { ...this.props.pagination }
                                    });
                                }}>
                                {
                                    handleUpdate => <Button color="success" onClick={this.state.name === "" || this.state.email === "" || this.state.gender === "" ? this.validate : handleUpdate}>Update</Button>
                                }
                            </Mutation>
                            <Button color="danger" onClick={this.props.toggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal >
        )
    }
}


export default EditUser;