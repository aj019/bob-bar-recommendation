import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Helper function to calculate cosine similarity
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Function to get embedding for a bottle
const getBottleEmbedding = async (bottle: Bottle): Promise<number[]> => {
  const bottleDescription = `${bottle.name} ${bottle.spirit_type} ${bottle.proof}proof $${bottle.avg_msrp}`;
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: bottleDescription,
  });
  return response.data[0].embedding;
};

// Function to find similar bottles using embeddings
const findSimilarBottles = async (userBottle: Bottle, allBottles: Bottle[], limit: number = 5): Promise<Array<{ bottle: Bottle; reason: string }>> => {
  const userEmbedding = await getBottleEmbedding(userBottle);
  
  // Get embeddings for all bottles and calculate similarities
  const bottlesWithSimilarity = await Promise.all(
    allBottles.map(async (bottle) => {
      const embedding = await getBottleEmbedding(bottle);
      const similarity = cosineSimilarity(userEmbedding, embedding);
      
      // Generate recommendation reason
      const reasons = [];
      if (bottle.spirit_type === userBottle.spirit_type) {
        reasons.push(`same spirit type (${bottle.spirit_type})`);
      }
      if (Math.abs((bottle.avg_msrp || 0) - (userBottle.avg_msrp || 0)) < 30) {
        reasons.push('similar price range');
      }
      if (Math.abs((bottle.proof || 0) - (userBottle.proof || 0)) < 10) {
        reasons.push('similar proof');
      }
      if (bottle.brand_id === userBottle.brand_id) {
        reasons.push('same brand');
      }
      
      const reason = `Based on ${reasons.join(', ')} as ${userBottle.name}`;
      
      return { bottle, similarity, reason };
    })
  );

  // Sort by similarity and return top matches
  return bottlesWithSimilarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ bottle, reason }) => ({ bottle, reason }));
};

export interface Bottle {
  id: number;
  name: string;
  size: number|string;
  proof: number | null;
  abv: number | null;
  spirit_type: string;
  brand_id: number | null;
  popularity: number | null;
  image_url: string;
  avg_msrp: number | null;
  fair_price: number;
  shelf_price: number;
  total_score: number;
  wishlist_count: number;
  vote_count: number;
  bar_count: number;
  ranking: number;
}

export interface BarData {
  bottles: Bottle[];
}

export const fetchUserBarData = async (username: string): Promise<BarData> => {
  const response = await axios.get(`https://services.baxus.co/api/bar/user/${username}`, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  // console.log(response);
  // Add check for response status
  // if (response.status !== 200) {
//   const sampleResponse = [
//     {
//         "id": 1030823,
//         "bar_id": 1030823,
//         "price": null,
//         "note": null,
//         "created_at": "2024-03-14T22:47:31.183Z",
//         "updated_at": "2024-08-26T19:11:25.442Z",
//         "user_id": 100248,
//         "release_id": 13266,
//         "fill_percentage": 0,
//         "added": "2024-03-12T00:00:00.000Z",
//         "user": {
//             "user_name": "carriebaxus"
//         },
//         "product": {
//             "id": 13266,
//             "name": "Heaven Hill Bottled In Bond 7 Year",
//             "image_url": "https://d1w35me0y6a2bb.cloudfront.net/newproducts/recSJfTSxTvljLvF8",
//             "brand_id": 430,
//             "brand": "Heaven Hill",
//             "spirit": "Bourbon",
//             "size": "750",
//             "proof": 100,
//             "average_msrp": 39.99,
//             "fair_price": 41.79,
//             "shelf_price": 47.19,
//             "popularity": 100083,
//             "created": 1606080229977,
//             "updated": 1744906420523,
//             "barcode": "096749002429,096749004942,093799006049",
//             "barrel_pick": false,
//             "user_added_id": 140857,
//             "submitter_email": "info@baxus.co",
//             "submitter_username": "baxustest",
//             "private": false,
//             "verified_date": 1710970749000,
//             "user_added": false
//         }
//     },
//     {
//         "id": 1007256,
//         "bar_id": 1007256,
//         "price": null,
//         "note": "",
//         "created_at": "2024-03-05T14:21:37.321Z",
//         "updated_at": "2025-01-24T02:06:45.915Z",
//         "user_id": 100248,
//         "release_id": 24961,
//         "fill_percentage": 0,
//         "added": "2024-03-05T00:00:00.000Z",
//         "user": {
//             "user_name": "carriebaxus"
//         },
//         "product": {
//             "id": 24961,
//             "name": "Rare Perfection 14 Year",
//             "image_url": "https://d1w35me0y6a2bb.cloudfront.net/newproducts/247ad792-6d80-4d4d-92f6-4789183cd2f0",
//             "brand_id": 2827,
//             "brand": "Rare Perfection",
//             "spirit": "Canadian Whisky",
//             "size": "750",
//             "proof": 100.7,
//             "average_msrp": 160,
//             "fair_price": 164.85,
//             "shelf_price": 179.39,
//             "popularity": 0,
//             "created": 1709648481347,
//             "updated": 1744906210294,
//             "barcode": "852543006311",
//             "barrel_pick": false,
//             "user_added_id": 100248,
//             "submitter_email": "carrie@baxus.co",
//             "submitter_username": "carriebaxus",
//             "private": false,
//             "verified_date": 1721925966000,
//             "user_added": false
//         }
//     }
// ]
  const sampleResponse = response.data
    // Convert sample response to Bottle[] only picking out the product fields
    const bottles = sampleResponse.map(item => {
      return {
        id: item.product.id,
        name: item.product.name,
        image_url: item.product.image_url,
        brand_id: item.product.brand_id,
        spirit_type: item.product.spirit,
        size: item.product.size,
        proof: item.product.proof,
        abv: item.product.proof ? item.product.proof / 2 : null,
        avg_msrp: item.product.average_msrp,
        fair_price: item.product.fair_price,
        shelf_price: item.product.shelf_price,
        popularity: item.product.popularity,
        total_score: 0,
        wishlist_count: 0,
        vote_count: 0,
        bar_count: 0,
        ranking: 0
      }
    });
    return { bottles };
  // }
  // return response.data;
};

export interface RecommendationWithReason {
  bottle: Bottle;
  reason: string;
}

export const getRecommendations = async (userBottles: Bottle[], allBottles: Bottle[]): Promise<RecommendationWithReason[]> => {
  try {
    // Get similar bottles for each user bottle
    const similarBottlesPromises = userBottles.map(bottle => 
      findSimilarBottles(bottle, allBottles.filter(b => b.id !== bottle.id))
    );
    
    // Wait for all similarity searches to complete
    const similarBottlesSets = await Promise.all(similarBottlesPromises);
    
    // Flatten and deduplicate recommendations
    const recommendations = Array.from(
      new Map(
        similarBottlesSets.flat()
          .map(item => [item.bottle.id, item])
      ).values()
    ).slice(0, 6); // Limit to 6 recommendations

    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Return mock recommendations in case of error
    return [
      {
        bottle: {
          "id": 158,
          "name": "Weller Antique 107",
          "size": 750,
          "proof": null,
          "abv": 53.5,
          "spirit_type": "Bourbon",
          "brand_id": 156,
          "popularity": 100266,
          "image_url": "https://d1w35me0y6a2bb.cloudfront.net/newproducts/rec8X36afthvgqzO9",
          "avg_msrp": 56.35,
          "fair_price": 116.66,
          "shelf_price": 109.89,
          "total_score": 40001,
          "wishlist_count": 8098,
          "vote_count": 13989,
          "bar_count": 17914,
          "ranking": 5
        },
        reason: "Based on similar price range, same spirit type (Bourbon)"
      },
      {
        bottle: {
          "id": 2803,
          "name": "Weller Special Reserve",
          "size": 750,
          "proof": null,
          "abv": 45,
          "spirit_type": "Bourbon",
          "brand_id": 156,
          "popularity": 100328,
          "image_url": "https://d1w35me0y6a2bb.cloudfront.net/newproducts/rec3BbLSm2nodYUyX",
          "avg_msrp": 29.49,
          "fair_price": 58.63,
          "shelf_price": 64.99,
          "total_score": 39429,
          "wishlist_count": 3810,
          "vote_count": 9769,
          "bar_count": 25850,
          "ranking": 6
        },
        reason: "Based on same brand, same spirit type (Bourbon)"
      }
    ];
  }
}; 