export default interface DataItem {
  country: string;
  answer: string;
  "embedding-x": number;
  "embedding-y": number;
  similarity: number[];
  cluster: number;
}
