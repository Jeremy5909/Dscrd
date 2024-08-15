require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');

const port = process.env.PORT || 8080;
const app = express();

app.get('/api/auth/discord/redirect', async (req,_) => {
    const { code } = req.query;

    if (code) {

        // Exchange code for token & refresh token
        const formData = new url.URLSearchParams({
            client_id: process.env.ClientID,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: `http://localhost:${port}/api/auth/discord/redirect`
        });

        const output = await axios.post('https://discord.com/api/v10/oauth2/token', 
            formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
        });

        if (output.data) {
            const access = output.data.access_token;
            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`
                },
            });


            // Refresh token
            const formData1 = new url.URLSearchParams({
                client_id: process.env.ClientID,
                client_secret: process.env.ClientSecret,
                grant_type: 'refresh_token',
                refresh_token: output.data.refresh_token
            });

            const refresh = await axios.post('https://discord.com/api/v10/oauth2/token', 
                formData1, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
            });


            console.log(output.data, userinfo.data, refresh.data)
        }
    }
});

app.listen(port, () => {console.log(`Running on ${port}`)} )
