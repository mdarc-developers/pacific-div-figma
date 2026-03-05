import React from "react";

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
      {title}
    </h2>
    {children}
  </div>
);

export const Body = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
    {children}
  </p>
);

export const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);
