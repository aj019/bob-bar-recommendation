# Bob's Bar

A React application that helps users manage their whisky collection and get personalized recommendations.

## Features

- User authentication via username
- Display of user's existing whisky collection
- AI-powered recommendations based on:
  - Similar price ranges
  - Similar flavor profiles
  - Complementary styles
  - Regional diversity

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Technologies Used

- React
- TypeScript
- Material-UI
- OpenAI API
- Axios

## Project Structure

- `src/App.tsx` - Main application component
- `src/services.ts` - API and OpenAI integration
- `src/bottlesDataset.ts` - Dataset of available whisky bottles

## API Endpoints

- `GET http://services.baxus.co/api/bar/user/{username}` - Fetch user's bar data
