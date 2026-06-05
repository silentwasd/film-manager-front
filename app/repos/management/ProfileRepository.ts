import SingletonCrudRepository from "~/repos/SingletonCrudRepository";
import type ProfileResource from "~/resources/management/ProfileResource";

export default class ProfileRepository extends SingletonCrudRepository<ProfileResource, number> {
    protected baseUrl: string = '/management/profile';
}