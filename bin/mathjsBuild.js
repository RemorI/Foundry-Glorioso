import { create, all } from 'mathjs';

const math = create(all, {
    matrix: 'Array'
});

if (typeof window !== 'undefined') {
    globalThis.math = math;
}

export default math;
