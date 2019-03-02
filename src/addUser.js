import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Form, FormGroup, Input } from 'reactstrap';

const ADD_USER = gql`
            mutation addNewUser($name: String!, $gender: String! , $email: String!) {
                addUser(name: $name, gender: $gender, email: $email)
                {
                    id,
                    name,
                    gender,
                    email
                }
        }`
class AddUser extends Component {
    state = {
        name: "",
        email: "",
        gender: "",
        submitted: false
    }
    closeModal = () => {
        this.setState({
            name: "",
            email: "",
            gender: "",
            submitted: false
        });
        this.props.toggle();
    }
    validate = () => {
        this.setState({ submitted: true })
    }
    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.closeModal}>Please add your details</ModalHeader>
                <ModalBody>
                    <Form>
                        <Input type="text" name="name" placeholder="Name" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                        {(this.state.submitted && this.state.name === "") ? <p style={{ color: "red" }}>Please enter your name</p> : null}
                        <br />
                        <Input type="email" name="email" placeholder="Email" value={this.state.email} onChange={e => this.setState({ email: e.target.value })} />
                        {(this.state.submitted && this.state.email === "") ? <p style={{ color: "red" }}>Please enter your email</p> : null}
                        <br />
                        Select your gender:
                        <FormGroup check>
                            <Input type="radio" name="gender" value="Male" onChange={() => this.setState({ gender: "Male" })} />{" "}
                            Male
                        </FormGroup>
                        <FormGroup check>
                            <Input type="radio" name="gender" value="Female" onChange={() => this.setState({ gender: "Female" })} />{" "}
                            Female
                        </FormGroup>
                        {(this.state.submitted && this.state.gender === "") ? <p style={{ color: "red" }}>Please select your gender</p> : null}
                        <ModalFooter>
                            <Mutation mutation={ADD_USER} variables={{ ...this.state }} onCompleted={this.closeModal}
                                update={(cache, { data: { addUser } }) => {
                                    let { GET_USERS, COUNT_USERS } = this.props.query;
                                    const { users } = cache.readQuery({ query: GET_USERS, variables: { ...this.props.pagination } });
                                    const { countUsers } = cache.readQuery({ query: COUNT_USERS })
                                    users.unshift(addUser);
                                    //let splicedUser = null;
                                    if (users.length > this.props.pagination.numOfRecords) {
                                        users.splice(users.length - 1, 1);
                                    }
                                    cache.writeQuery({
                                        query: GET_USERS,
                                        data: { users: users },
                                        variables: { ...this.props.pagination }
                                    });
                                    //countUsers update
                                    cache.writeQuery({
                                        query: COUNT_USERS,
                                        data: { countUsers: countUsers + 1 }
                                    })

                                    //add users spliced logic
                                    // if (splicedUser) {
                                    //     let nextUsers = [];
                                    //     let { pageNum, sortColumn, sorting, numOfRecords } = this.props.pagination;
                                    //     pageNum = pageNum + 1;
                                    //     if (countUsers + 1 >= this.props.pagination.numOfRecords) {
                                    //         nextUsers = cache.readQuery({ query: GET_USERS, variables: { sortColumn, sorting, numOfRecords, pageNum } }).users;
                                    //     }
                                    //     cache.writeQuery({
                                    //         query: GET_USERS,
                                    //         data: { users: [...nextUsers, splicedUser] },
                                    //         variables: { ...this.props.pagination, pageNum }
                                    //     })
                                    // }
                                }}
                            >
                                {
                                    handleSubmit => <Button color="success" onClick={this.state.name === "" || this.state.email === "" || this.state.gender === "" ? this.validate : handleSubmit}>Submit</Button>
                                }
                            </Mutation>
                            <Button color="danger" onClick={this.closeModal}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal >
        )
    }
}
export default AddUser;