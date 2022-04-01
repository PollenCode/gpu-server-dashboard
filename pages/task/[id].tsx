import { useRouter } from "next/router";

export default function TaskById() {
    const router = useRouter();

    return <p>The task with id {router.query.id} is displayed here</p>;
}
