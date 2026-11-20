import Datasets from "./datasets.js";

export default Super =>
    class extends Super {

        // protected
        async _install () {
            return new Datasets( this.app, this.config );
        }

        async _start () {
            return this.instance.start();
        }
    };
