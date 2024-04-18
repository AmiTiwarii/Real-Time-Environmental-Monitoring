import  { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
 const [data, setData] = useState(null);

 useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/environmental-data');
        const { compressedData, huffmanCode } = response.data;
        if (!huffmanCode) {
            console.error('Huffman code is undefined or null');
            setData('Error: Huffman code not received');
            return;
        }
        const decompressedData = decompressData(compressedData, huffmanCode);
        // Assuming decompressedData is a JSON string, parse it
        const parsedData = JSON.parse(decompressedData);
        setData(parsedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
 }, []);

 return (
    <div>
      {/* Render your environmental data here */}
      {data && data.hourly && (
        <div>
          {data.hourly.time.map((time, index) => (
            <div key={index}>
              <p>Time: {time}</p>
              <p>Temperature: {data.hourly.temperature_2m[index]}°C</p>
            </div>
          ))}
        </div>
      )}
    </div>
 );
}

// Implement the decompression function here
function decompressData(compressedData, huffmanCode) {
    if (!huffmanCode) {
        console.error('Huffman code is undefined or null');
        return 'Error: Huffman code not received';
    }

    // Reverse the Huffman code mapping to create a lookup table
    const reverseHuffmanCode = {};
    for (const [char, code] of Object.entries(huffmanCode)) {
        reverseHuffmanCode[code] = char;
    }

    // Function to find the longest prefix in the compressed data
    function findLongestPrefix(prefix) {
        if (reverseHuffmanCode.hasOwnProperty(prefix)) {
            return reverseHuffmanCode[prefix];
        }
        if (prefix.length === 1) {
            return null;
        }
        return findLongestPrefix(prefix.slice(0, -1));
    }

    let decompressedData = '';
    let currentPrefix = '';
    for (const bit of compressedData) {
        currentPrefix += bit;
        const char = findLongestPrefix(currentPrefix);
        if (char) {
            decompressedData += char;
            currentPrefix = '';
        }
    }

    return decompressedData;
}

export default Dashboard;