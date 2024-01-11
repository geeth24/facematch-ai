'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';

type Result = {
  is_same_person: boolean;
  similarity_score: number;
};
export default function Home() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (e.target.name === 'file1') {
      setFile1(file);
    } else {
      setFile2(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file1 || !file2) {
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await fetch('https://api.facematch.reactiveshots.com/compare-faces/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      // console.log(data);
      setResult({
        is_same_person: data.is_same_person,
        similarity_score: data.similarity_score.toFixed(2),
      });

      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black py-2 text-white">
      {result && (
        <div>
          <h1
            className={`text-center text-8xl font-bold 
            ${result.similarity_score > 0.5 ? 'text-green-500' : 'text-red-500'}`}
          >
            {result.similarity_score * 100}%
          </h1>
        </div>
      )}
      <h1 className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-center text-8xl font-bold text-transparent">
        Is it the same person?
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mt-4 flex flex-col items-center justify-center space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Image
              src={file1 ? URL.createObjectURL(file1) : 'https://via.placeholder.com/200'}
              width={200}
              height={200}
              alt="file1"
              className={`h-[calc(100vw/2)] w-[calc(100vw/2)] rounded object-cover md:h-[calc(100vw/4)] md:w-[calc(100vw/4)]
              ${
                result && result.similarity_score > 0.5
                  ? 'border-4 border-green-500 shadow-lg shadow-green-500'
                  : `${
                      result && result.similarity_score < 0.5
                        ? 'border-4 border-red-500 shadow-lg shadow-red-500'
                        : ''
                    }`
              }`}
            />
            <input
              type="file"
              name="file1"
              onChange={handleFileChange}
              className="text-sm text-white file:mr-5 file:rounded file:border-0 file:bg-gradient-to-r file:from-green-400 file:to-blue-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:file:cursor-pointer hover:file:bg-blue-600"
            />
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            <Image
              src={file2 ? URL.createObjectURL(file2) : 'https://via.placeholder.com/200'}
              width={200}
              height={200}
              alt="file2"
              className={`h-[calc(100vw/2)] w-[calc(100vw/2)] rounded object-cover md:h-[calc(100vw/4)] md:w-[calc(100vw/4)]
              ${
                result && result.similarity_score > 0.5
                  ? 'border-4 border-green-500 shadow-lg shadow-green-500'
                  : `${
                      result && result.similarity_score < 0.5
                        ? 'border-4 border-red-500 shadow-lg shadow-red-500'
                        : ''
                    }`
              }`}
            />
            <input
              type="file"
              name="file2"
              className="text-sm text-white file:mr-5 file:rounded file:border-0 file:bg-gradient-to-r file:from-green-400 file:to-blue-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:file:cursor-pointer hover:file:bg-blue-600"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded bg-gradient-to-r from-green-400 to-blue-500 p-4 text-xl font-bold text-white hover:cursor-pointer hover:opacity-80"
        >
          Compare
        </button>
      </form>
    </div>
  );
}
