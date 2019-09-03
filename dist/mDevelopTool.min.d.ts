/**
 * mDevelopTool type definitions
 */

declare module 'mDevelopTool' {

    export interface Config {
        options?: Object,
        currentTab?: String
    }

    export class DevelopToolInstance {
        constructor(config?: Config)

        //properties
        readonly pluginList: Object
        
        //methods
        render(): void

        destroy(): void
        
        show(): void
        
        hide(): void
    }

    export class DevelopTool extends DevelopToolInstance{}
    
    export default DevelopTool
}