import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const channels = () => {
    return (<Query query={gql`
            {
                channels {
   	            id
                name
                }
            }
    `}>
        {({ loading, error, data }) => {
            if (loading) return <p>loading...</p>
            if (error) return <p>Error encountered</p>
            return data.channels.map((channel) => (
                <li key={channel.id}>{channel.name}</li>
            ))
        }}
    </Query>)
};

export default channels;