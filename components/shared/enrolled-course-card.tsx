import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import Image from "next/image";
import Link from "next/link";

export interface CourseDetails {
  _id: string;
  thumbnail: string;
  title: string;
}

export interface InstructorDetails {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
}

export default function EnrolledCourseCard({
  course,
  instructor,
}: {
  course: CourseDetails;
  instructor: InstructorDetails;
}) {
  return (
    <Card
      as={Link}
      href={`/course/${course._id}`}
      key={course._id}
      shadow="none"
      className="py-4 border-none"
      isBlurred
    >
      <CardBody className="overflow-visible py-2">
        <Image
          alt={`${course.title} Thumbnail`}
          className="object-cover rounded-xl w-full"
          src={course.thumbnail}
          width={300}
          height={300}
        />
        <h4 className="mt-2 font-semibold">{course.title}</h4>
        <div className="flex justify-start mt-2">
          <User
            name={`${instructor.firstName} ${instructor.lastName}`}
            description={`@${instructor.username}`}
            avatarProps={{
              src: instructor.profilePicture,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
