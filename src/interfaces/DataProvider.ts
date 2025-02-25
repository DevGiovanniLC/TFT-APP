export interface DataProvider {
    getWeights(): Promise<any>;
    initializeConnection(): Promise<any>;
}
