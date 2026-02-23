/// <reference types="vite/client" />

declare module '*.svg' {
    import { FunctionComponent, SVGAttributes } from 'react'
    const content: FunctionComponent<SVGAttributes<SVGElement>>
    export default content
}

declare module '*.svg?url' {
    const src: string
    export default src
}
