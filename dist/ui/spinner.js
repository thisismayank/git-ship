import ora from 'ora';
export function createSpinner(text) {
    return ora({ text, spinner: 'dots' });
}
export async function withSpinner(text, fn) {
    const spinner = createSpinner(text).start();
    try {
        const result = await fn();
        spinner.succeed();
        return result;
    }
    catch (error) {
        spinner.fail();
        throw error;
    }
}
//# sourceMappingURL=spinner.js.map