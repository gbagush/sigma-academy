import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import Image from "next/image";
import Link from "next/link";

export interface Course {
  _id: string;
  description: string;
  language: string;
  thumbnail: string;
  title: string;
  updatedAt: string;
  discountedPrice: string;
  price: string;
  status: string;
  publishedAt: string;
  instructorDetails: InstructorDetail[];
  categoryDetails: CategoryDetails;
}
interface CategoryDetails {
  _id: string;
  name: string;
  parent?: string;
}
interface InstructorDetail {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  username?: string;
}

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

export default function CourseCard({ course }: { course: Course }) {
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
        <h5 className="text-sm">
          {course.instructorDetails[0].firstName}{" "}
          {course.instructorDetails[0].lastName}
        </h5>
        <div className="flex gap-1 mt-2 items-center">
          <h4 className="font-semibold">
            {formatCurrency(course.discountedPrice)}
          </h4>
          <h5 className="text-sm line-through text-foreground/75">
            {course.price !== course.discountedPrice
              ? formatCurrency(course.price)
              : ""}
          </h5>
        </div>
      </CardBody>
    </Card>
  );
}
