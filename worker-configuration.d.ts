// Worker environment bindings for Cloudflare
declare global {
			interface Env {
				R2_BUCKET: {
					get(key: string): Promise<any>;
					put(key: string, value: any, options?: any): Promise<any>;
				};
				DB: {
					prepare(sql: string): {
						run(): Promise<{ success: boolean; meta: any }>;
						first(): Promise<any>;
						bind(...args: any[]): {
							run(): Promise<{ success: boolean; meta: any }>;
							first(): Promise<any>;
						};
					};
				};
			}
}

export {};
