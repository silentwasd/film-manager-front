import Repository from "~/repos/Repository";

export default class SpeedRepository extends Repository {
    public index() {
        return this.client.getData<{stream: string}>('speed', '/speed');
    }
}