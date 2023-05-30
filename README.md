# Beats and Blockchains

The Stock Market in the Music Industry has become increasingly popular in the modern day. Not only are audio streaming services such as Spotify or Sirius XM interested in selling stock, but many artists have taken interest in the market as well. Artists have decided to sell the rights to their music for their own price and our team at Beats and Blockchains is determined to make this process nice and simple for our customers.

# Setup Guide

## Installing dependencies

```
npm install
```

## Seeding the music songs data and stock industries data

```
npm run seed
```

## .Env File for Spotify API:

Please add the .env file in the code for SPOTIFY API integration with the code. It contains the 'CLIENTID' and 'CLIENTSECRET' to authenticate a user.(We are providing the .env file in our zip code)


## Running instructions:

```
npm start
```

# Endpoints

Access the product at:
http://localhost:3000/

View all the available songs in the market whose rights you can buy at :
http://localhost:3000/songs

View all the music stocks which you can invest in :
http://localhost:3000/industries

View you wallet at:
http://localhost:3000/wallet

# Demo

Home Page for our site:

![1](/demo/1.png)

A new user can sign up by clicking on the sign up logo:

![2](/demo/2.png)

An existing user can log into his account by clicking on log in button:

![3](/demo/3.png)

You get to choose the following options:

![4](/demo/4.png)

## Music Rights

By clicking on the music rights page, you get list of all the songs. You can click on any header to sort the list:

![5](/demo/5.png)

By clicking on a particular songs you get details and option to buy the rights:

![6](/demo/6.png)

On clicking on 'buy now' option , the song gets added to the wallet of a user and becomes unavailable from the market.

![7](/demo/7.png)

A user can sell a song by clicking on sell button next to the song on wallet page. On clicking the 'Sell' button, the user gets prompted with following message:

![11](/demo/11.png)

After user agrees to sell the song, it becomes available in market and the wallet gets updated with profit added to user's wallet after selling the rights to that song.

## Music Industries

By clicking on the industries page, you get list of all the music industries. You can click on any industry to buy its stocks:

![8](/demo/8.png)

On clicking on a particular stock, you can view the details and slect how many stocks of that industry you wish to buy:

![9](/demo/9.png)

On clicking on 'buy now' option , the song gets added to the wallet of a user:

![10](/demo/10.png)

A user can sell percentage of stocks by clicking on sell button next to the stocks on wallet page. On clicking the 'Sell' button, the user gets prompted with following message:

![12](/demo/12.png)

After user enters the number of stocks he wants to sell and submits , then the wallet gets updated with the profit added to user's wallet by selling those number of stocks.

Wallet Page for a user looks like below with all the trasactions and holdings details. It also shows the graph of how the stocks of that particular user perform for a given day.

![13](/demo/13.png)
